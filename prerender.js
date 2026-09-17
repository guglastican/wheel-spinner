/**
 * prerender.js — static site generation for every public URL.
 *
 * For each locale × route it writes dist/<path>/index.html containing:
 *   • localized <title>, meta description, Open Graph / Twitter tags
 *   • a self-referencing canonical + reciprocal hreflang set
 *   • a JSON-LD graph (WebPage / WebApplication / FAQPage / BreadcrumbList)
 *   • real localized page content inside <div id="app">
 *
 * The content is the same copy the Vue components render from the locale
 * files, so a crawler that does not execute JavaScript still sees a complete
 * page, and a visitor sees that content until the app mounts over it.
 *
 * Run after `vite build` (see the "build" script in package.json).
 */

const fs = require('fs');
const path = require('path');

const cfg = require('./seo-config.js');
const content = require('./seo-content.js');

const {
    DOMAIN,
    SITE_NAME,
    SITE_PUBLISHED,
    RTL_LOCALES,
    SUPPORTED_LOCALES,
    BASE_ROUTES,
    NON_CONTENT_ROUTES,
    ROUTE_SECTIONS,
    ROUTE_LABELS,
    PAGE_META_KEYS,
    WIDGET_META_KEYS,
    LANG_NAMES,
    ROBOTS_INDEX,
    ROBOTS_NOINDEX,
    t,
    node,
    stripTags,
    buildDescription,
    localePrefix,
    routePath,
    pageUrl,
    isTranslated,
    hreflangEntries,
    pageLastModified
} = cfg;

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('Build output not found! Run "vite build" first.');
    process.exit(1);
}

const baseHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

if (!baseHtml.includes('<div id="app"></div>')) {
    console.error('Could not find <div id="app"></div> in dist/index.html — aborting.');
    process.exit(1);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const escapeHtml = content.esc;

/** Replace the first match of `re`, or append `tag` before </head> when absent. */
function replaceOrInsert(html, re, tag) {
    if (re.test(html)) return html.replace(re, tag);
    return html.replace('</head>', `  ${tag}\n</head>`);
}

/** Build the <link rel="alternate"> block for a route. */
function buildHreflangTags(route) {
    return hreflangEntries(route)
        .map((entry) => `  <link rel="alternate" hreflang="${escapeHtml(entry.hreflang)}" href="${escapeHtml(entry.href)}" />`)
        .join('\n');
}

// ─── Localized metadata ──────────────────────────────────────────────────────

function getLocalizedMeta(locale, route) {
    const brand = t(locale, 'footer.randoWheel') || SITE_NAME;
    const widget = WIDGET_META_KEYS[route];
    const keys = widget || PAGE_META_KEYS[route] || PAGE_META_KEYS[''];
    const title = stripTags(t(locale, keys.titleKey)) || ROUTE_LABELS[route] || SITE_NAME;
    const h1 = widget ? title : (stripTags(t(locale, keys.h1Key)) || title);
    const description = buildDescription(locale, route);
    return { title: `${title} | ${brand}`, description, h1 };
}

// ─── Structured data ─────────────────────────────────────────────────────────

const PAGE_ALT_NAMES = {
    '': ['Random Wheel Spinner', 'Wheel Spinner', 'Spin the Wheel', 'Random Wheel', 'Random Picker Wheel'],
    'wheel-of-names': ['Wheel of Names', 'Random Name Picker', 'Name Wheel', 'Name Picker'],
    'yes-no-wheel': ['Yes or No Wheel', 'Yes No Wheel', 'Yes No Picker', 'Decision Wheel'],
    'food-wheel': ['Food Wheel', 'What Should I Eat', 'Food Picker Wheel', 'Random Food Picker'],
    'spin-the-wheel': ['Spin the Wheel', 'Custom Wheel Spinner', 'Random Picker', 'Picker Wheel'],
    'twister-spinner': ['Twister Spinner', 'Twister Wheel', 'Twister Game Spinner', 'Twister Move Picker']
};

const APP_FEATURES = ['Free to use', 'Customizable wheel', 'Weighted options', 'No sign-up required', 'Works on any device'];

/** Localized FAQ entities for FAQPage schema (pages that ship a `faqs` block). */
function buildFaqEntities(locale, route) {
    const section = ROUTE_SECTIONS[route];
    if (!section) return null;
    const faqs = node(locale, `${section}.faqs`);
    if (!faqs || typeof faqs !== 'object') return null;
    const items = [];
    let i = 1;
    while (faqs[`${i}Title`] != null && faqs[`${i}Desc`] != null) {
        const question = stripTags(faqs[`${i}Title`]);
        const answer = stripTags(faqs[`${i}Desc`]);
        if (question && answer) {
            items.push({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } });
        }
        i += 1;
    }
    return items.length ? items : null;
}

/** Full schema.org @graph for one locale × route page. */
function buildJsonLd(locale, route) {
    const meta = getLocalizedMeta(locale, route);
    const url = pageUrl(locale, route);
    const lastmod = pageLastModified(locale, route) || SITE_PUBLISHED;
    const orgId = `${DOMAIN}/#organization`;
    const websiteId = `${DOMAIN}/#website`;
    const webappId = `${url}#webapp`;

    const graph = [
        {
            '@id': `${url}#webpage`,
            '@type': 'WebPage',
            name: meta.title,
            description: meta.description,
            url,
            inLanguage: locale,
            isPartOf: { '@id': websiteId },
            about: { '@id': webappId },
            datePublished: SITE_PUBLISHED,
            dateModified: lastmod,
            primaryImageOfPage: { '@type': 'ImageObject', url: `${DOMAIN}/preview.png` }
        },
        {
            '@id': webappId,
            '@type': 'WebApplication',
            name: meta.h1,
            alternateName: PAGE_ALT_NAMES[route] || [],
            description: meta.description,
            url,
            inLanguage: locale,
            applicationCategory: 'UtilitiesApplication',
            operatingSystem: 'Any',
            browserRequirements: 'Requires JavaScript',
            datePublished: SITE_PUBLISHED,
            dateModified: lastmod,
            isPartOf: { '@id': websiteId },
            publisher: { '@id': orgId },
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
            featureList: APP_FEATURES
        },
        {
            '@id': orgId,
            '@type': 'Organization',
            name: SITE_NAME,
            url: DOMAIN,
            logo: { '@type': 'ImageObject', url: `${DOMAIN}/logo_random_wheel.svg` },
            description: 'Rando Wheel provides free online wheel spinners for random selection, decision making, giveaways, classrooms, and party games.'
        },
        {
            '@id': websiteId,
            '@type': 'WebSite',
            name: SITE_NAME,
            url: DOMAIN,
            publisher: { '@id': orgId }
        }
    ];

    const faq = buildFaqEntities(locale, route);
    if (faq) {
        graph.push({
            '@id': `${url}#faq`,
            '@type': 'FAQPage',
            inLanguage: locale,
            isPartOf: { '@id': websiteId },
            mainEntity: faq
        });
    }

    if (route) {
        const keys = PAGE_META_KEYS[route] || PAGE_META_KEYS[''];
        const pageName = stripTags(t(locale, keys.titleKey)) || ROUTE_LABELS[route];
        graph.push({
            '@id': `${url}#breadcrumb`,
            '@type': 'BreadcrumbList',
            itemListElement: [
                { '@type': 'ListItem', position: 1, name: stripTags(t(locale, 'header.randomWheel')) || 'Home', item: `${DOMAIN}${localePrefix(locale) || '/'}` },
                { '@type': 'ListItem', position: 2, name: pageName, item: url }
            ]
        });
    }

    return { '@context': 'https://schema.org', '@graph': graph };
}

function buildJsonLdTag(locale, route) {
    const json = JSON.stringify(buildJsonLd(locale, route), null, 2).replace(/<\//g, '<\\/');
    return `  <script type="application/ld+json">\n${json}\n  </script>`;
}

// ─── Page assembly ───────────────────────────────────────────────────────────

/**
 * Builds one complete HTML document.
 *
 * @param {object} options
 * @param {string} options.locale
 * @param {string} options.route          '' for home
 * @param {boolean} options.indexable     false → noindex, no hreflang, no JSON-LD
 * @param {string} options.bodyHtml       markup placed inside <div id="app">
 */
function buildPage({ locale, route, indexable, bodyHtml }) {
    const meta = getLocalizedMeta(locale, route);
    const url = pageUrl(locale, route);
    const dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
    let html = baseHtml;

    // <html lang dir>
    html = html.replace(/<html(?:[^>]*)?>/i, `<html lang="${escapeHtml(locale)}" dir="${dir}">`);

    // Title + description
    html = replaceOrInsert(html, /<title>[\s\S]*?<\/title>/i, `  <title>${escapeHtml(meta.title)}</title>`);
    html = replaceOrInsert(
        html,
        /<meta\s+name="description"[^>]*>/i,
        `  <meta name="description" content="${escapeHtml(meta.description)}" />`
    );
    html = replaceOrInsert(
        html,
        /<meta\s+name="robots"[^>]*>/i,
        `  <meta name="robots" content="${indexable ? ROBOTS_INDEX : ROBOTS_NOINDEX}" />`
    );

    // Open Graph / Twitter — localized so shared links match the page language
    html = replaceOrInsert(html, /<meta\s+property="og:url"[^>]*>/i, `  <meta property="og:url" content="${escapeHtml(url)}" />`);
    html = replaceOrInsert(html, /<meta\s+property="og:title"[^>]*>/i, `  <meta property="og:title" content="${escapeHtml(meta.h1)}" />`);
    html = replaceOrInsert(html, /<meta\s+property="og:description"[^>]*>/i, `  <meta property="og:description" content="${escapeHtml(meta.description)}" />`);
    html = replaceOrInsert(html, /<meta\s+name="twitter:title"[^>]*>/i, `  <meta name="twitter:title" content="${escapeHtml(meta.h1)}" />`);
    html = replaceOrInsert(html, /<meta\s+name="twitter:description"[^>]*>/i, `  <meta name="twitter:description" content="${escapeHtml(meta.description)}" />`);

    // Canonical + hreflang (self-referencing). Non-indexable routes get a
    // self-canonical and no alternates so they cannot leak the home canonical.
    const headExtras = [`  <link rel="canonical" href="${escapeHtml(url)}" />`];
    if (indexable) headExtras.push(buildHreflangTags(route));
    headExtras.push(`  <style id="rw-prerender-css">\n${content.buildPrerenderCss()}\n  </style>`);
    if (indexable) headExtras.push(buildJsonLdTag(locale, route));
    html = html.replace('</head>', `${headExtras.filter(Boolean).join('\n')}\n</head>`);

    // Crawlable page body
    html = html.replace('<div id="app"></div>', `<div id="app">\n${bodyHtml}\n</div>`);

    return html;
}

/** Small noindex body for widget/config routes so they are never "empty". */
function buildNonContentBody(locale) {
    const links = BASE_ROUTES.map((route) => {
        const label = ROUTE_LABELS[route];
        return `        <li><a class="rw-pr-link" href="${escapeHtml(pageUrl(locale, route))}">${escapeHtml(label)}</a></li>`;
    }).join('\n');
    return `  <div class="rw-pr">
    <main class="rw-pr-main">
      <h1 class="rw-pr-h1">${escapeHtml(t(locale, 'header.embed') || 'Embed')} — ${escapeHtml(SITE_NAME)}</h1>
      <p class="rw-pr-lead">${escapeHtml(t(locale, 'embed.settingsTitle') || 'Embeddable wheel configuration page.')}</p>
      <section class="rw-pr-sec">
        <h2 class="rw-pr-h2">${escapeHtml(t(locale, 'exploreMore.title') || 'Explore More Free Spinning Wheels')}</h2>
        <ul class="rw-pr-cards">
${links}
        </ul>
      </section>
    </main>
  </div>`;
}

// ─── Generation ──────────────────────────────────────────────────────────────

console.log('Starting static prerender...');

let written = 0;
function writePage(relDir, html) {
    const outDir = path.join(DIST_DIR, relDir);
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, 'index.html'), html);
    written += 1;
}

// 1. Content pages: every translated locale × route, plus the EN home at "/".
for (const route of BASE_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
        if (!isTranslated(locale, route)) continue;
        const bodyHtml = content.buildContentHtml(locale, route);
        const html = buildPage({ locale, route, indexable: true, bodyHtml });
        writePage(routePath(locale, route), html);
    }
}
console.log(`  ✓ ${written} indexable page(s) (locale × route)`);

// 2. Non-content routes (embeddable widgets + config): noindex, self-canonical.
const nonContentBefore = written;
for (const route of NON_CONTENT_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
        const bodyHtml = buildNonContentBody(locale);
        const html = buildPage({ locale, route, indexable: false, bodyHtml });
        writePage(routePath(locale, route), html);
    }
}
console.log(`  ✓ ${written - nonContentBefore} noindex widget page(s)`);

// 3. Note: every SPA route in src/main.js is covered by the two loops above,
//    so the blanket "rewrite everything to /index.html" rule in vercel.json is
//    no longer needed (it made unknown URLs return a 200 soft-404 copy of the
//    home page, which Google reports as "Duplicate / Soft 404").

console.log(`\nPrerender complete: ${written} HTML file(s).`);
console.log('  - unique localized <title>, description, H1 and body copy per URL');
console.log(`  - canonical + ${hreflangEntries('').length}-entry hreflang set (reciprocal, translated locales only)`);
console.log('  - JSON-LD graph (WebPage, WebApplication, FAQPage, BreadcrumbList)');
console.log('  - no hidden-text blocks: content is real, visible markup');
