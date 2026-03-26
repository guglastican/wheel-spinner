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

const PAGE_TITLE_KEYS = {
    '': 'home.mainTitle',
    'wheel-of-names': 'namesPage.title',
    'yes-no-wheel': 'yesNoPage.title',
    'food-wheel': 'foodPage.title',
    'spin-the-wheel': 'spinPage.title',
    'twister-spinner': 'twisterPage.title'
};

// Load all locale data once
const LOCALE_DATA = {};
SUPPORTED_LOCALES.forEach(lang => {
    const p = path.join(__dirname, 'src', 'locales', `${lang}.json`);
    if (fs.existsSync(p)) {
        LOCALE_DATA[lang] = JSON.parse(fs.readFileSync(p, 'utf8'));
    }
});

function hasTranslation(localeData, route) {
    if (!localeData) return false;
    const key = PAGE_TITLE_KEYS[route];
    if (!key) return true;
    const parts = key.split('.');
    let current = localeData;
    for (const part of parts) {
        if (!current[part]) return false;
        current = current[part];
    }
    return true;
}

function generateSitemap() {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    const lastmod = new Date().toISOString().split('T')[0];

    for (const route of BASE_ROUTES) {
        for (const locale of SUPPORTED_LOCALES) {
            // Only add this URL if the page is actually translated in this locale
            if (!hasTranslation(LOCALE_DATA[locale], route)) continue;

            const isDefault = locale === 'en';
            const localePrefix = isDefault ? '' : `/${locale}`;
            const pathSuffix = route ? `/${route}` : '';
            const loc = `${DOMAIN}${localePrefix}${pathSuffix}`;

            xml += '  <url>\n';
            xml += `    <loc>${loc}</loc>\n`;
            xml += `    <lastmod>${lastmod}</lastmod>\n`;
            xml += `    <changefreq>monthly</changefreq>\n`;
            xml += `    <priority>${route === '' ? '1.0' : '0.8'}</priority>\n`;

            // Add hreflang for ALL locales that have this page translated
            for (const altLocale of SUPPORTED_LOCALES) {
                if (!hasTranslation(LOCALE_DATA[altLocale], route)) continue;

                const altIsDefault = altLocale === 'en';
                const altPrefix = altIsDefault ? '' : `/${altLocale}`;
                const altLoc = `${DOMAIN}${altPrefix}${pathSuffix}`;
                xml += `    <xhtml:link rel="alternate" hreflang="${altLocale}" href="${altLoc}"/>\n`;
            }

            // x-default hreflang (always point to English version)
            const xDefaultLoc = `${DOMAIN}${pathSuffix}`;
            xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultLoc}"/>\n`;

            xml += '  </url>\n';
        }
    }

    xml += '</urlset>';

    const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, xml);
    console.log(`Sitemap generated successfully at ${outputPath}`);
}

generateSitemap();

// Also generate robots.txt while we're at it
const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(__dirname, 'public', 'robots.txt'), robotsTxt);
console.log('robots.txt generated successfully.');
