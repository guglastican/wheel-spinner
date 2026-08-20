const fs = require('fs');
const path = require('path');

const DOMAIN = 'https://randowheel.com';

const SUPPORTED_LOCALES = [
    'en', 'es', 'de', 'ja', 'fr', 'pt', 'zh-CN', 'ar', 'it', 'ru', 'hi', 'nl', 'tr', 'ko', 'id', 'vi', 'pl', 'th', 'sv', 'el', 'ro', 'cs', 'hu', 'bn', 'he'
];

const BASE_ROUTES = [
    '', // Home
    'wheel-of-names',
    'yes-no-wheel',
    'food-wheel',
    'spin-the-wheel',
    'twister-spinner'
];

// Human-readable labels for each route (English, crawlers don't need localization)
const ROUTE_LABELS = {
    '': 'Home — Random Wheel Spinner',
    'wheel-of-names': 'Wheel of Names',
    'yes-no-wheel': 'Yes or No Wheel',
    'food-wheel': 'Food Wheel',
    'spin-the-wheel': 'Spin the Wheel',
    'twister-spinner': 'Twister Spinner',
};

// ─── Localized metadata (per-page title / description / H1) ──────────────────
// Load all locale data so every prerendered URL gets unique, localized
// <title>, meta description and crawlable text. Without this, all 150 URLs
// serve the same generic English shell and Google treats them as duplicates
// ("Discovered – currently not indexed").
const LOCALE_DATA = {};
SUPPORTED_LOCALES.forEach(lang => {
    const p = path.join(__dirname, 'src', 'locales', `${lang}.json`);
    if (fs.existsSync(p)) {
        try {
            LOCALE_DATA[lang] = JSON.parse(fs.readFileSync(p, 'utf8'));
        } catch (e) {
            console.warn(`  ⚠ Could not parse ${lang}.json: ${e.message}`);
        }
    }
});

const PAGE_META_KEYS = {
    '': { titleKey: 'home.mainTitle', descKey: 'home.whatIsDesc', h1Key: 'home.mainTitle' },
    'wheel-of-names': { titleKey: 'namesPage.title', descKey: 'namesPage.heroDesc', h1Key: 'namesPage.heroTitle' },
    'yes-no-wheel': { titleKey: 'yesNoPage.title', descKey: 'yesNoPage.heroDesc', h1Key: 'yesNoPage.heroTitle' },
    'food-wheel': { titleKey: 'foodPage.title', descKey: 'foodPage.heroDesc', h1Key: 'foodPage.heroTitle' },
    'spin-the-wheel': { titleKey: 'spinPage.title', descKey: 'spinPage.heroDesc', h1Key: 'spinPage.heroTitle' },
    'twister-spinner': { titleKey: 'twisterPage.title', descKey: 'twisterPage.heroDesc', h1Key: 'twisterPage.heroTitle' }
};

function getKey(obj, keyPath) {
    if (!obj || !keyPath) return undefined;
    return keyPath.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

function stripTags(html) {
    return String(html == null ? '' : html)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function escapeXml(str) {
    return String(str == null ? '' : str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

/**
 * Build localized title/description/H1 for a locale × route combo.
 * Falls back to English when a locale lacks a key.
 */
function getLocalizedMeta(locale, route) {
    const keys = PAGE_META_KEYS[route] || PAGE_META_KEYS[''];
    const data = LOCALE_DATA[locale] || {};
    const enData = LOCALE_DATA['en'] || {};
    const brand = getKey(data, 'footer.randoWheel') || getKey(enData, 'footer.randoWheel') || 'Rando Wheel';
    const title = getKey(data, keys.titleKey) || getKey(enData, keys.titleKey) || 'Random Wheel';
    const h1 = getKey(data, keys.h1Key) || title;
    const description = stripTags(getKey(data, keys.descKey)) || stripTags(getKey(enData, keys.descKey)) || '';
    return { title: `${title} | ${brand}`, description, h1 };
}

/**
 * Localized crawlable text block for JS-disabled crawlers, so the raw HTML
 * of every URL is unique (title + H1 + description in the page's language).
 */
function buildLocalizedNoscript(locale, route) {
    const meta = getLocalizedMeta(locale, route);
    const localePrefix = locale === 'en' ? '' : `/${locale}`;
    const pathSuffix = route ? `/${route}` : '';
    const url = `${DOMAIN}${localePrefix}${pathSuffix}`;
    return `
  <noscript>
    <div style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
      <h1>${escapeXml(meta.h1)}</h1>
      <p>${escapeXml(meta.description)}</p>
      <p><a href="${escapeXml(url)}">${escapeXml(url)}</a></p>
    </div>
  </noscript>`;
}

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('Build output not found! Run "vite build" first.');
    process.exit(1);
}

const originalHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build all hreflang <link> tags for a given route path suffix.
 * Every language variant points to that page in its own language.
 * x-default always points to the English (root) version.
 */
function buildHreflangTags(pathSuffix) {
    const lines = [];
    SUPPORTED_LOCALES.forEach(lang => {
        const prefix = lang === 'en' ? '' : `/${lang}`;
        const href = `${DOMAIN}${prefix}${pathSuffix}`;
        lines.push(`  <link rel="alternate" hreflang="${lang}" href="${href}" />`);
        if (lang === 'zh-CN') {
            lines.push(`  <link rel="alternate" hreflang="zh" href="${href}" />`);
        }
    });
    lines.push(`  <link rel="alternate" hreflang="x-default" href="${DOMAIN}${pathSuffix}" />`);
    return lines.join('\n');
}

/**
 * Build a static crawlable navigation block with outgoing <a> links.
 * This is injected into every prerendered page so Googlebot sees proper
 * outgoing internal links even without executing JavaScript.
 *
 * @param {string} currentRoute  - The route slug for this page (e.g. 'yes-no-wheel')
 * @param {string} locale        - The locale code (e.g. 'es', 'en')
 */
function buildStaticNav(currentRoute, locale) {
    const localePrefix = locale === 'en' ? '' : `/${locale}`;

    // Build nav links — skip current page to keep it clean, but always include all pages
    const navLinks = BASE_ROUTES.map(route => {
        const href = `${DOMAIN}${localePrefix}${route ? `/${route}` : ''}`;
        const label = ROUTE_LABELS[route];
        const isCurrent = route === currentRoute;
        return `      <a href="${href}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
    }).join('\n');

    // Also add cross-language links for this page so Google sees the language graph
    const pathSuffix = currentRoute ? `/${currentRoute}` : '';
    const langLinks = SUPPORTED_LOCALES.map(lang => {
        const prefix = lang === 'en' ? '' : `/${lang}`;
        const href = `${DOMAIN}${prefix}${pathSuffix}`;
        return `      <a href="${href}" hreflang="${lang}">${lang.toUpperCase()}</a>`;
    }).join('\n');

    return `
  <!-- Static crawler navigation — hidden visually, essential for SEO link graph -->
  <noscript>
    <nav aria-label="Site navigation" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;">
      <h2>Pages</h2>
${navLinks}
      <h2>Languages</h2>
${langLinks}
    </nav>
  </noscript>
  <div id="seo-nav" style="position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden;" aria-hidden="true">
    <nav>
${navLinks}
    </nav>
  </div>`;
}

// ─── Processing ───────────────────────────────────────────────────────────────

console.log('Starting Post-Build Prerendering...');

// ─── 1. Patch root dist/index.html (English home) ───────────────────────────
let rootHtml = originalHtml;
rootHtml = rootHtml.replace(/<link\s+rel="alternate"[^>]*hreflang[^>]*\/?>/gi, '');
rootHtml = rootHtml.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, '');

// Localized title + meta description for the EN home
const homeMeta = getLocalizedMeta('en', '');
rootHtml = rootHtml.replace(/<title>[\s\S]*?<\/title>/i, `  <title>${escapeXml(homeMeta.title)}</title>`);
rootHtml = rootHtml.replace(/<meta\s+name="description"[^>]*>/i, `  <meta name="description" content="${escapeXml(homeMeta.description)}" />`);

const homeHreflang = buildHreflangTags('');
const homeCanonical = `  <link rel="canonical" href="${DOMAIN}/" />`;
rootHtml = rootHtml.replace('</head>', `${homeCanonical}\n${homeHreflang}\n</head>`);

// Inject static nav + localized text before closing </body>
const homeNav = buildStaticNav('', 'en');
const homeNoscript = buildLocalizedNoscript('en', '');
rootHtml = rootHtml.replace('</body>', `${homeNav}\n${homeNoscript}\n</body>`);

fs.writeFileSync(INDEX_HTML_PATH, rootHtml);
console.log('  ✓ Patched dist/index.html (EN home)');

// ─── 2. Generate each locale × route combination ────────────────────────────
SUPPORTED_LOCALES.forEach(locale => {
    const isDefault = locale === 'en';

    BASE_ROUTES.forEach(route => {
        // English home handled above
        if (isDefault && route === '') return;

        const langPrefix = isDefault ? '' : locale;
        const outDirPath = path.join(DIST_DIR, langPrefix, route);
        const pathSuffix = route ? `/${route}` : '';
        const localeUrlPrefix = isDefault ? '' : `/${locale}`;
        const thisPageUrl = `${DOMAIN}${localeUrlPrefix}${pathSuffix}`;

        // Ensure output directory exists
        if (!fs.existsSync(outDirPath)) {
            fs.mkdirSync(outDirPath, { recursive: true });
        }

        let html = originalHtml;

        // 1. Strip stale hreflang/canonical tags from base HTML
        html = html.replace(/<link\s+rel="alternate"[^>]*hreflang[^>]*\/?>/gi, '');
        html = html.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, '');

        // 2. Set correct <html lang="...">
        html = html.replace(/<html(?:[^>]*)?>/i, `<html lang="${locale}">`);

        // 3. Inject hreflang + canonical into <head>
        const hreflangTags = buildHreflangTags(pathSuffix);
        const canonicalTag = `  <link rel="canonical" href="${thisPageUrl}" />`;
        html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n</head>`);

        // 4. Localized <title>, meta description and OG tags — makes the raw
        //    HTML of every locale×route URL unique instead of one English shell
        const meta = getLocalizedMeta(locale, route);
        html = html.replace(/<title>[\s\S]*?<\/title>/i, `  <title>${escapeXml(meta.title)}</title>`);
        html = html.replace(/<meta\s+name="description"[^>]*>/i, `  <meta name="description" content="${escapeXml(meta.description)}" />`);
        html = html.replace(/<meta\s+property="og:title"[^>]*>/i, `  <meta property="og:title" content="${escapeXml(meta.h1)}" />`);
        html = html.replace(/<meta\s+property="og:description"[^>]*>/i, `  <meta property="og:description" content="${escapeXml(meta.description)}" />`);

        // 5. Inject static crawlable nav block before </body>
        //    This gives crawlers real outgoing <a href> links to follow
        const staticNav = buildStaticNav(route, locale);
        const localizedNoscript = buildLocalizedNoscript(locale, route);
        html = html.replace('</body>', `${staticNav}\n${localizedNoscript}\n</body>`);

        // Save
        fs.writeFileSync(path.join(outDirPath, 'index.html'), html);
    });
});

// ─── Summary ─────────────────────────────────────────────────────────────────
const totalFiles = SUPPORTED_LOCALES.reduce((acc, locale) => {
    return acc + BASE_ROUTES.filter(r => !(locale === 'en' && r === '')).length;
}, 0) + 1; // +1 for root index.html

console.log(`\nPrerendering complete!`);
console.log(`✓ ${totalFiles} HTML files generated with:`);
console.log(`  - Correct <html lang="..."> attribute`);
console.log(`  - Per-page <link rel="canonical"> tag`);
console.log(`  - Full hreflang tag set (${SUPPORTED_LOCALES.length} languages + zh alias + x-default)`);
console.log(`  - Static crawlable navigation with all outgoing internal links`);
