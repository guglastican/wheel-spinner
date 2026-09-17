import { createApp, nextTick, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import i18n, { SUPPORTED_LOCALES } from './i18n.js';

import HomePage from './pages/HomePage.vue';
import YesNoWheelPage from './pages/YesNoWheelPage.vue';
import EmbedWheelPage from './pages/EmbedWheelPage.vue';
import EmbedYesNoWheelPage from './pages/EmbedYesNoWheelPage.vue';
import EmbedConfigPage from './pages/EmbedConfigPage.vue';
import EmbedTwisterSpinnerPage from './pages/EmbedTwisterSpinnerPage.vue';
import WheelOfNamesPage from './pages/WheelOfNamesPage.vue';
import FoodWheelPage from './pages/FoodWheelPage.vue';
import SpinTheWheelPage from './pages/SpinTheWheelPage.vue';
import TwisterSpinnerPage from './pages/TwisterSpinnerPage.vue';
import App from './App.vue';

// Create regex to match any of the non-English locale codes for dynamic routing
const localeRegex = SUPPORTED_LOCALES.filter(l => l !== 'en').join('|');

// Robots directives — kept identical to the values prerendered into the static
// HTML (see seo-config.js) so the served and rendered pages agree.
const ROBOTS_INDEX = 'index, follow, max-image-preview:large, max-snippet:-1';
const ROBOTS_NOINDEX = 'noindex, follow';

// Right-to-left locales
const RTL_LOCALES = ['ar', 'he'];

const SITE_ORIGIN = 'https://randowheel.com';

/**
 * Same plain-text truncation that prerender.js applies to the meta
 * description, so the served HTML and the client-rendered DOM never differ.
 */
function buildMetaDescription(value, max = 155) {
  const plain = String(value == null ? '' : value)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= max) return plain;
  const cut = plain.slice(0, max);
  const boundary = cut.lastIndexOf(' ');
  return `${(boundary > 60 ? cut.slice(0, boundary) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** Path with any locale prefix removed ('/es/food-wheel' → '/food-wheel'). */
function pathWithoutLocale(path) {
  const match = path.match(new RegExp(`^/(${localeRegex})(?=/|$)`));
  if (!match) return path || '/';
  return path.slice(match[0].length) || '/';
}

/** Absolute canonical URL for a router location in the current locale. */
function canonicalUrlFor(path, locale) {
  const base = pathWithoutLocale(path);
  const prefix = locale === 'en' ? '' : `/${locale}`;
  const suffix = base === '/' ? '' : base;
  return `${SITE_ORIGIN}${prefix}${suffix}`;
}

const baseRoutes = [
  {
    path: '',
    component: HomePage,
    meta: {
      canonicalPath: '',
      titleKey: 'home.mainTitle',
      descKey: 'home.whatIsDesc',
      robots: ROBOTS_INDEX
    }
  },
  {
    path: 'yes-no-wheel',
    component: YesNoWheelPage,
    meta: {
      canonicalPath: 'yes-no-wheel',
      titleKey: 'yesNoPage.title',
      descKey: 'yesNoPage.heroDesc',
      robots: ROBOTS_INDEX
    }
  },
  {
    path: 'embed',
    component: EmbedWheelPage,
    meta: {
      titleKey: 'embed.settingsTitle',
      robots: ROBOTS_NOINDEX
    }
  },
  {
    path: 'embed-yes-no',
    component: EmbedYesNoWheelPage,
    meta: {
      titleKey: 'embed.settingsTitle',
      robots: ROBOTS_NOINDEX
    }
  },
  {
    path: 'embed-twister-spinner',
    component: EmbedTwisterSpinnerPage,
    meta: {
      titleKey: 'embed.settingsTitle',
      robots: ROBOTS_NOINDEX
    }
  },
  {
    path: 'configure-embed',
    component: EmbedConfigPage,
    meta: {
      titleKey: 'header.configureEmbed',
      robots: ROBOTS_NOINDEX
    }
  },
  {
    path: 'wheel-of-names',
    component: WheelOfNamesPage,
    meta: {
      canonicalPath: 'wheel-of-names',
      titleKey: 'namesPage.title',
      descKey: 'namesPage.heroDesc',
      robots: ROBOTS_INDEX
    }
  },
  {
    path: 'food-wheel',
    component: FoodWheelPage,
    meta: {
      canonicalPath: 'food-wheel',
      titleKey: 'foodPage.title',
      descKey: 'foodPage.heroDesc',
      robots: ROBOTS_INDEX
    }
  },
  {
    path: 'spin-the-wheel',
    component: SpinTheWheelPage,
    meta: {
      canonicalPath: 'spin-the-wheel',
      titleKey: 'spinPage.title',
      descKey: 'spinPage.heroDesc',
      robots: ROBOTS_INDEX
    }
  },
  {
    path: 'twister-spinner',
    component: TwisterSpinnerPage,
    meta: {
      canonicalPath: 'twister-spinner',
      titleKey: 'twisterPage.title',
      descKey: 'twisterPage.seoDesc',
      robots: ROBOTS_INDEX
    }
  }
];

const routes = [
  {
    // Make locale optional so English operates at the root path '/'
    path: `/:locale(${localeRegex})?`,
    component: { render: () => h(RouterView) },
    children: baseRoutes
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation guard to update Locale
router.beforeEach((to, from, next) => {
  const paramLocale = to.params.locale || 'en';
  i18n.global.locale.value = paramLocale;
  document.documentElement.lang = paramLocale;
  document.documentElement.dir = RTL_LOCALES.includes(paramLocale) ? 'rtl' : 'ltr';
  next();
});

// ─── Client-side structured data ─────────────────────────────────────────────
// The static HTML already ships a complete, per-URL JSON-LD graph built by
// prerender.js. It is only rebuilt here for client-side navigations, so the
// graph always describes the URL currently on screen.
const SCHEMA_SECTIONS = {
  'wheel-of-names': 'namesPage',
  'yes-no-wheel': 'yesNoPage',
  'food-wheel': 'foodPage',
  'twister-spinner': 'twisterPage'
};

function buildClientJsonLd(to, locale, url) {
  if (!to.meta.canonicalPath) return null; // widget/config routes: no schema
  const routePath = to.meta.canonicalPath;
  const t = i18n.global.t;
  const messages = i18n.global.getLocaleMessage(locale) || {};
  const title = to.meta.titleKey ? t(to.meta.titleKey) : t('footer.randoWheel');
  const websiteId = `${SITE_ORIGIN}/#website`;
  const graph = [
    {
      '@id': `${url}#webpage`,
      '@type': 'WebPage',
      name: title,
      url,
      inLanguage: locale,
      isPartOf: { '@id': websiteId }
    },
    {
      '@id': `${url}#webapp`,
      '@type': 'WebApplication',
      name: title,
      url,
      inLanguage: locale,
      applicationCategory: 'UtilitiesApplication',
      operatingSystem: 'Any',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      isPartOf: { '@id': websiteId }
    }
  ];

  const sectionData = SCHEMA_SECTIONS[routePath] ? messages[SCHEMA_SECTIONS[routePath]] : null;
  const faqs = sectionData && sectionData.faqs;
  if (faqs) {
    const entities = [];
    let i = 1;
    while (faqs[`${i}Title`] != null && faqs[`${i}Desc`] != null) {
      entities.push({
        '@type': 'Question',
        name: String(faqs[`${i}Title`]).replace(/<[^>]*>/g, '').trim(),
        acceptedAnswer: { '@type': 'Answer', text: String(faqs[`${i}Desc`]).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() }
      });
      i += 1;
    }
    if (entities.length) {
      graph.push({ '@id': `${url}#faq`, '@type': 'FAQPage', inLanguage: locale, mainEntity: entities });
    }
  }

  graph.push({
    '@id': `${url}#breadcrumb`,
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: t('header.randomWheel'), item: `${SITE_ORIGIN}${locale === 'en' ? '/' : `/${locale}`}` },
      { '@type': 'ListItem', position: 2, name: title, item: url }
    ]
  });

  return { '@context': 'https://schema.org', '@graph': graph };
}

/** Replace build-time schema with schema for the newly navigated route. */
function updateRouteSchema(to, locale, url) {
  document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
  const schema = buildClientJsonLd(to, locale, url);
  if (!schema) return;
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.setAttribute('data-rw-dynamic', '1');
  script.text = JSON.stringify(schema);
  document.head.appendChild(script);
}

// The first afterEach call belongs to the initial page load, whose head tags
// were already generated correctly at build time.
let isInitialRoute = true;

// Navigation guard to dynamically update all SEO parameters post-navigation
router.afterEach((to) => {
  nextTick(() => {
    const locale = i18n.global.locale.value;
    const t = i18n.global.t;
    const canonicalUrl = canonicalUrlFor(to.path, locale);
    const isWidgetRoute = (to.meta.robots || ROBOTS_INDEX).startsWith('noindex');

    // Set Document Title
    if (to.meta.titleKey) {
      document.title = t(to.meta.titleKey) + ' | ' + t('footer.randoWheel');
    } else {
      document.title = t('footer.randoWheel');
    }

    // Set Document Description (same truncation as the prerendered HTML)
    if (to.meta.descKey) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = buildMetaDescription(t(to.meta.descKey));
    }

    // Canonical: every URL is self-canonical, including widget pages, so a
    // noindex widget can never claim the home page as its canonical URL.
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.rel = 'canonical';
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.href = canonicalUrl;

    // hreflang set — indexable pages only, reciprocal for every locale
    document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    if (!isWidgetRoute) {
      const pathSuffix = to.meta.canonicalPath ? `/${to.meta.canonicalPath}` : '';
      SUPPORTED_LOCALES.forEach(lang => {
        const prefix = lang === 'en' ? '' : `/${lang}`;
        const href = `${SITE_ORIGIN}${prefix}${pathSuffix}`;
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = href;
        document.head.appendChild(link);

        // Add generic 'zh' for 'zh-CN' to satisfy SEO suggestions
        if (lang === 'zh-CN') {
          const zhLink = document.createElement('link');
          zhLink.rel = 'alternate';
          zhLink.hreflang = 'zh';
          zhLink.href = href;
          document.head.appendChild(zhLink);
        }
      });

      const xDefault = document.createElement('link');
      xDefault.rel = 'alternate';
      xDefault.hreflang = 'x-default';
      xDefault.href = `${SITE_ORIGIN}${pathSuffix}`;
      document.head.appendChild(xDefault);
    }

    // Open Graph URL follows the current page
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = canonicalUrl;

    // Enforce Robot meta directions
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = to.meta.robots || ROBOTS_INDEX;

    // Structured data: the build-time graph stays untouched on the initial
    // load; client-side navigations get a graph for the new URL.
    if (isInitialRoute) {
      isInitialRoute = false;
      if (document.querySelectorAll('script[type="application/ld+json"]').length === 0) {
        updateRouteSchema(to, locale, canonicalUrl);
      }
    } else {
      updateRouteSchema(to, locale, canonicalUrl);
    }
  });
});

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount('#app');
