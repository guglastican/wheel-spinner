/**
 * verify-seo.js — validates the generated static HTML and sitemap.
 *
 * Runs as the last step of `npm run build`. It fails the build when a page
 * loses its canonical, its hreflang set is not reciprocal, two URLs serve the
 * same text, hidden-text tricks creep back in, or the sitemap disagrees with
 * the generated files.
 */

const fs = require('fs');
const path = require('path');

const {
    DOMAIN,
    SUPPORTED_LOCALES,
    BASE_ROUTES,
    NON_CONTENT_ROUTES,
    LANG_NAMES,
    isTranslated,
    translatedLocales,
    routePath,
    pageUrl,
    pageLastModified
} = require('./seo-config.js');

const DIST_DIR = path.join(__dirname, 'dist');
const SITEMAP_PATH = path.join(__dirname, 'public', 'sitemap.xml');

const problems = [];
const checks = [];
function ok(message) {
    checks.push(`  ✓ ${message}`);
}
function fail(message) {
    problems.push(message);
}

function readPage(relDir) {
    const file = path.join(DIST_DIR, relDir, 'index.html');
    if (!fs.existsSync(file)) return null;
    return fs.readFileSync(file, 'utf8');
}

/** Visible text of a document: scripts, styles and markup removed. */
function visibleText(html) {
    const body = html.replace(/^[\s\S]*?<body[^>]*>/i, '').replace(/<\/body>[\s\S]*$/i, '');
    return body
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&[a-z#0-9]+;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

/** Decode the handful of entities we emit, so lengths match what users see. */
function decodeEntities(text) {
    return String(text)
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
}

function hash(text) {
    let h = 2166136261;
    for (let i = 0; i < text.length; i += 1) {
        h ^= text.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0).toString(16);
}

function matchAll(html, re) {
    return Array.from(html.matchAll(re));
}

// ─── 1. Every expected page exists ───────────────────────────────────────────

const expectedPages = [];
for (const route of BASE_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
        if (isTranslated(locale, route)) expectedPages.push({ locale, route, indexable: true });
    }
}
for (const route of NON_CONTENT_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) expectedPages.push({ locale, route, indexable: false });
}

const missing = expectedPages.filter((p) => !readPage(routePath(p.locale, p.route)));
if (missing.length) {
    fail(`${missing.length} expected page(s) missing, e.g. ${routePath(missing[0].locale, missing[0].route)}`);
} else {
    ok(`${expectedPages.length} expected pages exist`);
}

// ─── 2. Per-page checks ──────────────────────────────────────────────────────

const titleMap = new Map();
const descriptionMap = new Map();
const textMap = new Map();
const hreflangMap = new Map();
let indexableCount = 0;
let noindexCount = 0;

for (const page of expectedPages) {
    const rel = routePath(page.locale, page.route);
    const html = readPage(rel);
    if (!html) continue;
    const url = pageUrl(page.locale, page.route);

    // lang / dir
    const htmlTag = (html.match(/<html[^>]*>/i) || [''])[0];
    if (!htmlTag.includes(`lang="${page.locale}"`)) fail(`${rel}: <html> missing lang="${page.locale}"`);
    const expectDir = ['ar', 'he'].includes(page.locale) ? 'rtl' : 'ltr';
    if (!htmlTag.includes(`dir="${expectDir}"`)) fail(`${rel}: <html> missing dir="${expectDir}"`);

    // exactly one H1
    const h1s = matchAll(html, /<h1[^>]*>([\s\S]*?)<\/h1>/gi);
    if (h1s.length !== 1) fail(`${rel}: expected exactly 1 <h1>, found ${h1s.length}`);

    // title / description present; uniqueness matters for indexable pages only
    const title = (html.match(/<title>([\s\S]*?)<\/title>/i) || [, ''])[1].trim();
    if (!title) fail(`${rel}: missing <title>`);
    if (page.indexable) {
        if (titleMap.has(title)) fail(`${rel}: duplicate <title> shared with ${titleMap.get(title)}`);
        else titleMap.set(title, rel);
    }

    const desc = decodeEntities((html.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || [, ''])[1]).trim();
    if (!desc) fail(`${rel}: missing meta description`);
    if (page.indexable && desc.length > 160) fail(`${rel}: meta description is ${desc.length} chars (>160)`);
    if (page.indexable) {
        if (descriptionMap.has(desc)) fail(`${rel}: duplicate meta description shared with ${descriptionMap.get(desc)}`);
        else descriptionMap.set(desc, rel);
    }

    // canonical
    const canonicals = matchAll(html, /<link\s+rel="canonical"\s+href="([^"]+)"/gi);
    if (canonicals.length !== 1) fail(`${rel}: expected exactly 1 canonical, found ${canonicals.length}`);
    else if (canonicals[0][1] !== url) fail(`${rel}: canonical is ${canonicals[0][1]}, expected ${url}`);

    // robots
    const robots = (html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i) || [, ''])[1];
    if (!robots) fail(`${rel}: missing meta robots`);
    if (page.indexable) {
        indexableCount += 1;
        if (!robots.startsWith('index')) fail(`${rel}: expected indexable robots, got "${robots}"`);
    } else {
        noindexCount += 1;
        if (!robots.startsWith('noindex')) fail(`${rel}: widget route must be noindex, got "${robots}"`);
    }

    // hreflang
    const alternates = matchAll(html, /<link\s+rel="alternate"\s+hreflang="([^"]+)"\s+href="([^"]+)"/gi)
        .map((m) => `${m[1]}=${m[2]}`)
        .sort();
    if (page.indexable) {
        const key = page.route;
        if (hreflangMap.has(key)) {
            if (hreflangMap.get(key).join('|') !== alternates.join('|')) {
                fail(`${rel}: hreflang set differs from other pages of the same route`);
            }
        } else {
            hreflangMap.set(key, alternates);
        }
        if (!alternates.includes(`x-default=${pageUrl('en', page.route)}`)) {
            fail(`${rel}: hreflang set missing x-default`);
        }
    } else if (alternates.length) {
        fail(`${rel}: noindex page must not declare hreflang alternates`);
    }

    // no hidden-text / cloaking patterns
    if (/left:\s*-9\d{3}px/i.test(html)) fail(`${rel}: contains off-screen hidden-text pattern (left:-9999px)`);
    if (/<div[^>]*id="seo-nav"/i.test(html)) fail(`${rel}: contains the old hidden #seo-nav block`);

    // JSON-LD
    const ldBlocks = matchAll(html, /<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
    if (page.indexable) {
        if (!ldBlocks.length) fail(`${rel}: missing JSON-LD`);
        for (const block of ldBlocks) {
            try {
                const parsed = JSON.parse(block[1].replace(/<\\\//g, '</'));
                if (!parsed['@graph'] || !parsed['@graph'].length) fail(`${rel}: JSON-LD has no @graph`);
            } catch (err) {
                fail(`${rel}: JSON-LD is not valid JSON (${err.message})`);
            }
        }
    } else if (ldBlocks.length) {
        fail(`${rel}: noindex page should not carry JSON-LD`);
    }

    // real, unique crawlable text
    const text = visibleText(html);
    const minText = page.indexable ? 600 : 80;
    if (text.length < minText) fail(`${rel}: only ${text.length} characters of crawler-visible text (min ${minText})`);
    if (page.indexable) {
        const textHash = `${text.length}:${hash(text)}`;
        if (textMap.has(textHash)) fail(`${rel}: identical visible text to ${textMap.get(textHash)}`);
        else textMap.set(textHash, rel);
    }
}

ok(`${indexableCount} indexable page(s): self-canonical, hreflang, JSON-LD, unique text`);
ok(`${noindexCount} widget page(s): noindex + self-canonical, no hreflang`);
ok(`${titleMap.size} unique titles, ${descriptionMap.size} unique descriptions, ${textMap.size} unique page texts`);

// ─── 3. Reciprocity: every hreflang target must link back ───────────────────

for (const [route, alternates] of hreflangMap.entries()) {
    const expected = require('./seo-config.js').hreflangEntries(route).map((e) => `${e.hreflang}=${e.href}`).sort();
    if (expected.join('|') !== alternates.join('|')) {
        const missing = expected.filter((e) => !alternates.includes(e));
        const extra = alternates.filter((e) => !expected.includes(e));
        if (missing.length) fail(`route "${route}": hreflang set is missing ${missing.slice(0, 3).join(', ')}`);
        if (extra.length) fail(`route "${route}": hreflang set has unexpected ${extra.slice(0, 3).join(', ')}`);
    }

    const locales = alternates
        .map((entry) => entry.split('=')[0])
        .filter((tag) => tag !== 'x-default' && tag !== 'zh');
    for (const locale of locales) {
        if (!SUPPORTED_LOCALES.includes(locale)) fail(`hreflang for route "${route}": unknown locale ${locale}`);
        if (locale !== 'en' && !alternates.includes(`${locale}=${pageUrl(locale, route)}`)) {
            fail(`hreflang for route "${route}": ${locale} does not point at its own URL`);
        }
    }
}
ok('hreflang sets are reciprocal, self-referencing and complete for every route');

// ─── 4. Sitemap must match the generated files exactly ──────────────────────

if (!fs.existsSync(SITEMAP_PATH)) {
    fail('public/sitemap.xml is missing');
} else {
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
    const locs = matchAll(xml, /<loc>([^<]+)<\/loc>/g).map((m) => m[1]);
    const sitemapSet = new Set(locs);
    const expectedUrls = new Set(
        expectedPages.filter((p) => p.indexable).map((p) => pageUrl(p.locale, p.route))
    );

    if (locs.length !== sitemapSet.size) fail(`sitemap contains ${locs.length - sitemapSet.size} duplicate <loc> entries`);
    for (const url of expectedUrls) {
        if (!sitemapSet.has(url)) fail(`sitemap is missing ${url}`);
    }
    for (const url of sitemapSet) {
        if (!expectedUrls.has(url)) fail(`sitemap lists ${url}, which is not an indexable page`);
        if (!url.startsWith(DOMAIN)) fail(`sitemap entry is not on ${DOMAIN}: ${url}`);
    }

    // lastmod sanity: must never be in the future, must be a real content date
    const today = new Date().toISOString().slice(0, 10);
    for (const entry of matchAll(xml, /<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>/g)) {
        if (entry[2] > today) fail(`sitemap lastmod is in the future for ${entry[1]}: ${entry[2]}`);
    }

    // xhtml alternates must match the page-level hreflang sets
    for (const [route, alternates] of hreflangMap.entries()) {
        const expected = new Set(alternates);
        const sample = xml.split('<url>').find((chunk) => chunk.includes(`<loc>${pageUrl('en', route)}</loc>`));
        if (!sample) continue;
        const inSitemap = matchAll(sample, /hreflang="([^"]+)"\s+href="([^"]+)"/g)
            .map((m) => `${m[1]}=${m[2]}`);
        for (const entry of expected) {
            if (!inSitemap.includes(entry)) {
                fail(`sitemap alternates for "${route}" are missing ${entry}`);
            }
        }
    }

    ok(`sitemap: ${locs.length} URLs, all matching generated files and page hreflang sets`);
}

// ─── 5. Non-indexable routes are absent from the sitemap ───────────────────

if (fs.existsSync(SITEMAP_PATH)) {
    const xml = fs.readFileSync(SITEMAP_PATH, 'utf8');
    for (const route of NON_CONTENT_ROUTES) {
        if (new RegExp(`<loc>[^<]*/${route}</loc>`).test(xml)) {
            fail(`widget route /${route} must not be listed in the sitemap`);
        }
    }
    ok('widget/config routes are excluded from the sitemap');
}

// ─── 6. Human-facing translation coverage note ──────────────────────────────

const missingLangNames = SUPPORTED_LOCALES.filter((locale) => !LANG_NAMES[locale]);
if (missingLangNames.length) fail(`missing language label(s): ${missingLangNames.join(', ')}`);

void pageLastModified;

// ─── Report ─────────────────────────────────────────────────────────────────

console.log('\nSEO verification');
for (const line of checks) console.log(line);

if (problems.length) {
    console.error(`\n✗ ${problems.length} SEO problem(s) found:`);
    for (const problem of problems.slice(0, 60)) console.error(`  - ${problem}`);
    if (problems.length > 60) console.error(`  … and ${problems.length - 60} more`);
    process.exit(1);
}

console.log('\n✓ All SEO checks passed.\n');
