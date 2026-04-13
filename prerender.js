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

const DIST_DIR = path.join(__dirname, 'dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');

if (!fs.existsSync(INDEX_HTML_PATH)) {
    console.error('Build output not found! Run "vite build" first.');
    process.exit(1);
}

const originalHtml = fs.readFileSync(INDEX_HTML_PATH, 'utf8');

/**
 * Build the full set of hreflang <link> tags for a given route (page path suffix).
 * Every language variant points to the same page in its own language.
 * x-default always points to the English (root) version.
 */
function buildHreflangTags(pathSuffix) {
    const lines = [];

    SUPPORTED_LOCALES.forEach(lang => {
        const prefix = lang === 'en' ? '' : `/${lang}`;
        const href = `${DOMAIN}${prefix}${pathSuffix}`;
        lines.push(`  <link rel="alternate" hreflang="${lang}" href="${href}" />`);

        // Add generic 'zh' alias for 'zh-CN'
        if (lang === 'zh-CN') {
            lines.push(`  <link rel="alternate" hreflang="zh" href="${href}" />`);
        }
    });

    // x-default always points to the English version
    const xDefaultHref = `${DOMAIN}${pathSuffix}`;
    lines.push(`  <link rel="alternate" hreflang="x-default" href="${xDefaultHref}" />`);

    return lines.join('\n');
}

console.log('Starting Post-Build Prerendering...');

// ─── 1. Patch the root dist/index.html (English home page) ─────────────────
// Remove any old static hreflang tags (from source index.html that got copied)
// then inject correct ones for the home page.
let rootHtml = originalHtml;
// Strip existing hreflang/canonical link tags written by hand in the source
rootHtml = rootHtml.replace(/<link\s+rel="alternate"[^>]*hreflang[^>]*\/?>/gi, '');
rootHtml = rootHtml.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, '');

const homeHreflang = buildHreflangTags(''); // '' = home, no path suffix
const homeCanonical = `  <link rel="canonical" href="${DOMAIN}/" />`;
// Inject before </head>
rootHtml = rootHtml.replace('</head>', `${homeCanonical}\n${homeHreflang}\n</head>`);
fs.writeFileSync(INDEX_HTML_PATH, rootHtml);
console.log('  ✓ Patched dist/index.html (EN home)');

// ─── 2. Generate each locale × route combination ────────────────────────────
SUPPORTED_LOCALES.forEach(locale => {
    const isDefault = locale === 'en';

    BASE_ROUTES.forEach(route => {
        // English home is handled above as dist/index.html
        if (isDefault && route === '') return;

        const langPrefix = isDefault ? '' : locale;
        const outDirPath = path.join(DIST_DIR, langPrefix, route);
        const pathSuffix = route ? `/${route}` : '';
        const localeUrlPrefix = isDefault ? '' : `/${locale}`;
        const thisPageUrl  = `${DOMAIN}${localeUrlPrefix}${pathSuffix}`;

        // Ensure folder exists
        if (!fs.existsSync(outDirPath)) {
            fs.mkdirSync(outDirPath, { recursive: true });
        }

        let html = originalHtml;

        // 1. Strip any leftover static hreflang/canonical tags from source
        html = html.replace(/<link\s+rel="alternate"[^>]*hreflang[^>]*\/?>/gi, '');
        html = html.replace(/<link\s+rel="canonical"[^>]*\/?>/gi, '');

        // 2. Set correct <html lang="...">
        html = html.replace(/<html(?:[^>]*)?>/i, `<html lang="${locale}">`);

        // 3. Build and inject hreflang tags + canonical for this specific page
        const hreflangTags = buildHreflangTags(pathSuffix);
        const canonicalTag = `  <link rel="canonical" href="${thisPageUrl}" />`;
        html = html.replace('</head>', `${canonicalTag}\n${hreflangTags}\n</head>`);

        // Save
        fs.writeFileSync(path.join(outDirPath, 'index.html'), html);
    });
});

// Summary
const totalFiles = SUPPORTED_LOCALES.reduce((acc, locale) => {
    return acc + BASE_ROUTES.filter(r => !(locale === 'en' && r === '')).length;
}, 0) + 1; // +1 for root index.html

console.log(`Prerendering complete! Generated/patched ${totalFiles} HTML files with correct hreflang tags.`);
