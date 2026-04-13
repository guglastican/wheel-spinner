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

const homeHreflang = buildHreflangTags('');
const homeCanonical = `  <link rel="canonical" href="${DOMAIN}/" />`;
rootHtml = rootHtml.replace('</head>', `${homeCanonical}\n${homeHreflang}\n</head>`);

// Inject static nav before closing </body>
const homeNav = buildStaticNav('', 'en');
rootHtml = rootHtml.replace('</body>', `${homeNav}\n</body>`);

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

        // 4. Inject static crawlable nav block before </body>
        //    This gives crawlers real outgoing <a href> links to follow
        const staticNav = buildStaticNav(route, locale);
        html = html.replace('</body>', `${staticNav}\n</body>`);

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
