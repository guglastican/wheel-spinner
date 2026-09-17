/**
 * seo-config.js — Single source of truth for locale/route/SEO facts.
 *
 * Shared by generate-sitemap.js (build-time sitemap) and prerender.js
 * (static HTML generation) so that <link rel="canonical">, hreflang, the
 * XML sitemap and the generated pages can never drift apart.
 *
 * CommonJS on purpose: both consumers are plain Node scripts run by npm scripts.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = __dirname;
const DOMAIN = 'https://randowheel.com';
const SITE_NAME = 'Rando Wheel';
const SITE_PUBLISHED = '2025-01-01';

/** Locales that are written right-to-left. */
const RTL_LOCALES = ['ar', 'he'];

const SUPPORTED_LOCALES = [
    'en', 'es', 'de', 'ja', 'fr', 'pt', 'zh-CN', 'ar', 'it', 'ru', 'hi', 'nl', 'tr', 'ko', 'id', 'vi', 'pl', 'th', 'sv', 'el', 'ro', 'cs', 'hu', 'bn', 'he'
];

/** Public, indexable content routes. '' is the home page. */
const BASE_ROUTES = [
    '', // Home
    'wheel-of-names',
    'yes-no-wheel',
    'food-wheel',
    'spin-the-wheel',
    'twister-spinner'
];

/**
 * Application-only routes: reachable URLs that must NEVER be indexed
 * (embeddable widgets, config screen). They are prerendered with
 * `noindex, follow` and a self-referencing canonical so they stop
 * inheriting the home page's canonical tag.
 */
const NON_CONTENT_ROUTES = [
    'embed',
    'embed-yes-no',
    'embed-twister-spinner',
    'configure-embed'
];

/** Locale JSON section holding the copy for each route. */
const ROUTE_SECTIONS = {
    '': 'home',
    'wheel-of-names': 'namesPage',
    'yes-no-wheel': 'yesNoPage',
    'food-wheel': 'foodPage',
    'spin-the-wheel': 'spinPage',
    'twister-spinner': 'twisterPage'
};

/** Human-readable route labels (English) — used for crawler-facing labels. */
const ROUTE_LABELS = {
    '': 'Random Wheel Spinner',
    'wheel-of-names': 'Wheel of Names',
    'yes-no-wheel': 'Yes or No Wheel',
    'food-wheel': 'Food Wheel',
    'spin-the-wheel': 'Spin the Wheel',
    'twister-spinner': 'Twister Spinner'
};

/** Vue page component responsible for a route (used for honest lastmod dates). */
const ROUTE_COMPONENTS = {
    '': 'HomePage.vue',
    'wheel-of-names': 'WheelOfNamesPage.vue',
    'yes-no-wheel': 'YesNoWheelPage.vue',
    'food-wheel': 'FoodWheelPage.vue',
    'spin-the-wheel': 'SpinTheWheelPage.vue',
    'twister-spinner': 'TwisterSpinnerPage.vue'
};

/** Title / description / heading keys per route. */
const PAGE_META_KEYS = {
    '': { titleKey: 'home.mainTitle', descKey: 'home.whatIsDesc', h1Key: 'home.mainTitle' },
    'wheel-of-names': { titleKey: 'namesPage.title', descKey: 'namesPage.heroDesc', h1Key: 'namesPage.heroTitle' },
    'yes-no-wheel': { titleKey: 'yesNoPage.title', descKey: 'yesNoPage.heroDesc', h1Key: 'yesNoPage.heroTitle' },
    'food-wheel': { titleKey: 'foodPage.title', descKey: 'foodPage.heroDesc', h1Key: 'foodPage.heroTitle' },
    'spin-the-wheel': { titleKey: 'spinPage.title', descKey: 'spinPage.heroDesc', h1Key: 'spinPage.heroTitle' },
    'twister-spinner': { titleKey: 'twisterPage.title', descKey: 'twisterPage.heroDesc', h1Key: 'twisterPage.heroTitle' }
};

/** Metadata for widget/config routes (noindex; never in the sitemap). */
const WIDGET_META_KEYS = {
    'embed': { titleKey: 'embed.settingsTitle', descKey: 'embed.heroDesc' },
    'embed-yes-no': { titleKey: 'embed.settingsTitle', descKey: 'embed.heroDesc' },
    'embed-twister-spinner': { titleKey: 'embed.settingsTitle', descKey: 'embed.heroDesc' },
    'configure-embed': { titleKey: 'header.configureEmbed', descKey: 'embed.instructions' }
};

/** Localized language names for the visible language switch / footer block. */
const LANG_NAMES = {
    'en': 'English', 'es': 'Español', 'de': 'Deutsch', 'ja': '日本語', 'fr': 'Français',
    'pt': 'Português', 'zh-CN': '简体中文', 'ar': 'العربية', 'it': 'Italiano', 'ru': 'Русский',
    'hi': 'हिन्दी', 'nl': 'Nederlands', 'tr': 'Türkçe', 'ko': '한국어', 'id': 'Bahasa Indonesia',
    'vi': 'Tiếng Việt', 'pl': 'Polski', 'th': 'ไทย', 'sv': 'Svenska', 'el': 'Ελληνικά',
    'ro': 'Română', 'cs': 'Čeština', 'hu': 'Magyar', 'bn': 'বাংলা', 'he': 'עברית'
};

/** Meta robots value used for indexable pages (kept identical in main.js). */
const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1';
/** Meta robots value used for widget/config routes. */
const ROBOTS_NOINDEX = 'noindex, follow';

// ─── Locale data ─────────────────────────────────────────────────────────────

const localeCache = {};

/** Parsed locale JSON (cached). Returns {} when unavailable. */
function getLocaleData(locale) {
    if (localeCache[locale] !== undefined) return localeCache[locale];
    const file = path.join(ROOT, 'src', 'locales', `${locale}.json`);
    let data = {};
    if (fs.existsSync(file)) {
        try {
            data = JSON.parse(fs.readFileSync(file, 'utf8'));
        } catch (err) {
            console.warn(`  ⚠ Could not parse ${locale}.json: ${err.message}`);
            data = {};
        }
    }
    localeCache[locale] = data;
    return data;
}

/** Safe dotted-path lookup. */
function getKey(obj, keyPath) {
    if (!obj || !keyPath) return undefined;
    return keyPath.split('.').reduce((acc, part) => (acc == null ? undefined : acc[part]), obj);
}

/**
 * Localized string for a dotted key, falling back to English.
 * Returns '' when neither locale has the key.
 */
function t(locale, keyPath) {
    const value = getKey(getLocaleData(locale), keyPath);
    if (value != null && value !== '') return value;
    const fallback = getKey(getLocaleData('en'), keyPath);
    return fallback == null ? '' : fallback;
}

/** Raw (non-string) node for a dotted key, English fallback. */
function node(locale, keyPath) {
    const value = getKey(getLocaleData(locale), keyPath);
    if (value != null) return value;
    return getKey(getLocaleData('en'), keyPath);
}

/** Strip markup and collapse whitespace. */
function stripTags(html) {
    return String(html == null ? '' : html)
        .replace(/<[^>]*>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Meta description used identically by prerender.js and main.js:
 * plain text, cut on a word boundary at <= max characters.
 */
function buildDescription(locale, route, max = 155) {
    const keys = WIDGET_META_KEYS[route] || PAGE_META_KEYS[route] || PAGE_META_KEYS[''];
    const text = stripTags(t(locale, keys.descKey));
    if (!text) return '';
    if (text.length <= max) return text;
    const cut = text.slice(0, max);
    const boundary = cut.lastIndexOf(' ');
    return `${(boundary > 60 ? cut.slice(0, boundary) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

// ─── URL helpers ─────────────────────────────────────────────────────────────

/** '' for English (root), '/xx' otherwise. */
function localePrefix(locale) {
    return locale === 'en' ? '' : `/${locale}`;
}

/** Path (no domain) for a locale × route pair. */
function routePath(locale, route) {
    return `${localePrefix(locale)}${route ? `/${route}` : ''}`;
}

/** Absolute, canonical URL for a locale × route pair. */
function pageUrl(locale, route) {
    return `${DOMAIN}${routePath(locale, route)}`;
}

/**
 * True when the locale actually carries localized copy for the route.
 * Used to keep hreflang, the sitemap and the generated files in sync.
 */
function isTranslated(locale, route) {
    const section = ROUTE_SECTIONS[route];
    if (!section) return false;
    const data = getLocaleData(locale);
    const sectionData = data[section];
    if (!sectionData) return false;
    if (route === '') return !!sectionData.mainTitle;
    return !!(sectionData.heroTitle && sectionData.heroDesc);
}

/** Locales that have content for the route (English first). */
function translatedLocales(route) {
    return SUPPORTED_LOCALES.filter((locale) => isTranslated(locale, route));
}

/**
 * Full hreflang set for a route: every translated locale + the zh alias for
 * zh-CN + x-default. Returns [{ hreflang, href }] and is used for both the
 * <link rel="alternate"> tags and the XML sitemap xhtml:link entries.
 */
function hreflangEntries(route) {
    const entries = [];
    for (const locale of translatedLocales(route)) {
        const href = pageUrl(locale, route);
        entries.push({ hreflang: locale, href });
        if (locale === 'zh-CN') entries.push({ hreflang: 'zh', href });
    }
    entries.push({ hreflang: 'x-default', href: pageUrl('en', route) });
    return entries;
}

// ─── Honest lastmod dates ────────────────────────────────────────────────────

const gitDateCache = {};

/**
 * Last commit date (YYYY-MM-DD) for a repo-relative file, falling back to the
 * file's mtime and finally to null. Using real content-change dates instead of
 * "today" for all 150 URLs keeps <lastmod> trustworthy.
 */
function fileDate(relPath) {
    if (gitDateCache[relPath] !== undefined) return gitDateCache[relPath];
    let date = null;
    try {
        const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relPath], {
            cwd: ROOT,
            encoding: 'utf8',
            stdio: ['ignore', 'pipe', 'ignore']
        }).trim();
        if (out) date = out.slice(0, 10);
    } catch (err) {
        /* git unavailable — fall through to mtime */
    }
    if (!date) {
        try {
            date = fs.statSync(path.join(ROOT, relPath)).mtime.toISOString().slice(0, 10);
        } catch (err) {
            date = null;
        }
    }
    gitDateCache[relPath] = date;
    return date;
}

/** Most recent content change that affects the given locale × route page. */
function pageLastModified(locale, route) {
    const files = [`src/locales/${locale}.json`];
    const component = ROUTE_COMPONENTS[route];
    if (component) files.push(`src/pages/${component}`);
    const dates = files.map(fileDate).filter(Boolean);
    if (!dates.length) return null;
    return dates.reduce((a, b) => (a > b ? a : b));
}

module.exports = {
    ROOT,
    DOMAIN,
    SITE_NAME,
    SITE_PUBLISHED,
    RTL_LOCALES,
    SUPPORTED_LOCALES,
    BASE_ROUTES,
    NON_CONTENT_ROUTES,
    ROUTE_SECTIONS,
    ROUTE_LABELS,
    ROUTE_COMPONENTS,
    PAGE_META_KEYS,
    WIDGET_META_KEYS,
    LANG_NAMES,
    ROBOTS_INDEX,
    ROBOTS_NOINDEX,
    getLocaleData,
    getKey,
    t,
    node,
    stripTags,
    buildDescription,
    localePrefix,
    routePath,
    pageUrl,
    isTranslated,
    translatedLocales,
    hreflangEntries,
    fileDate,
    pageLastModified
};
