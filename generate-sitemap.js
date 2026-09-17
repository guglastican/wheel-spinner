/**
 * generate-sitemap.js — writes public/sitemap.xml and public/robots.txt.
 *
 * Runs before `vite build` so the sitemap is copied into dist/. Content facts
 * come from seo-config.js, which prerender.js uses too, so the sitemap,
 * canonical tags and hreflang tags always describe the same set of URLs.
 *
 * Improvements over the previous version:
 *   • only URLs that actually exist with localized content are listed
 *   • xhtml:link alternates are reciprocal across all listed URLs
 *   • <lastmod> is the real last content change (git/file date), not "today"
 *     for all 150 URLs on every build
 */

const fs = require('fs');
const path = require('path');

const {
    DOMAIN,
    BASE_ROUTES,
    SUPPORTED_LOCALES,
    translatedLocales,
    pageUrl,
    pageLastModified,
    isTranslated
} = require('./seo-config.js');

function escapeXml(value) {
    return String(value == null ? '' : value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function generateSitemap() {
    const lines = [];
    lines.push('<?xml version="1.0" encoding="UTF-8"?>');
    lines.push('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">');

    let urlCount = 0;
    let alternativeCount = 0;

    for (const route of BASE_ROUTES) {
        const locales = translatedLocales(route);
        if (!locales.length) continue;

        // Reciprocal alternate set shared by every URL of this route
        const alternates = [];
        for (const locale of locales) {
            alternates.push({ hreflang: locale, href: pageUrl(locale, route) });
            if (locale === 'zh-CN') alternates.push({ hreflang: 'zh', href: pageUrl(locale, route) });
        }
        alternates.push({ hreflang: 'x-default', href: pageUrl('en', route) });

        for (const locale of locales) {
            const loc = pageUrl(locale, route);
            const lastmod = pageLastModified(locale, route);

            lines.push('  <url>');
            lines.push(`    <loc>${escapeXml(loc)}</loc>`);
            if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
            lines.push(`    <priority>${route === '' ? '1.0' : '0.8'}</priority>`);
            for (const alt of alternates) {
                lines.push(`    <xhtml:link rel="alternate" hreflang="${escapeXml(alt.hreflang)}" href="${escapeXml(alt.href)}"/>`);
                alternativeCount += 1;
            }
            lines.push('  </url>');
            urlCount += 1;
        }
    }

    lines.push('</urlset>');

    const outputPath = path.join(__dirname, 'public', 'sitemap.xml');
    fs.writeFileSync(outputPath, `${lines.join('\n')}\n`);
    console.log(`Sitemap written: ${urlCount} URLs, ${alternativeCount} hreflang alternates → ${outputPath}`);
}

function generateRobots() {
    // Widget/config routes stay crawlable on purpose: they carry a `noindex`
    // meta tag, and blocking them in robots.txt would hide that directive
    // (Google cannot read a noindex on a URL it is not allowed to fetch).
    const robots = [
        'User-agent: *',
        'Allow: /',
        '',
        `Sitemap: ${DOMAIN}/sitemap.xml`,
        ''
    ].join('\n');
    const outputPath = path.join(__dirname, 'public', 'robots.txt');
    fs.writeFileSync(outputPath, robots);
    console.log(`robots.txt written → ${outputPath}`);
}

generateSitemap();
generateRobots();

// Sanity guard: warn (do not fail) when a locale has no content for a route.
for (const route of BASE_ROUTES) {
    for (const locale of SUPPORTED_LOCALES) {
        if (!isTranslated(locale, route)) {
            console.warn(`  ⚠ ${locale}/${route || '(home)'} has no localized content — excluded from sitemap & hreflang`);
        }
    }
}
