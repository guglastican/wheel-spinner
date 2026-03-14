import { createApp, nextTick, h } from 'vue';
import { createRouter, createWebHistory, RouterView } from 'vue-router';
import i18n, { SUPPORTED_LOCALES } from './i18n.js';

import HomePage from './pages/HomePage.vue';
import YesNoWheelPage from './pages/YesNoWheelPage.vue';
import EmbedWheelPage from './pages/EmbedWheelPage.vue';
import EmbedYesNoWheelPage from './pages/EmbedYesNoWheelPage.vue';
import EmbedConfigPage from './pages/EmbedConfigPage.vue';
import WheelOfNamesPage from './pages/WheelOfNamesPage.vue';
import FoodWheelPage from './pages/FoodWheelPage.vue';
import SpinTheWheelPage from './pages/SpinTheWheelPage.vue';
import App from './App.vue';

// Create regex to match any of the non-English locale codes for dynamic routing
const localeRegex = SUPPORTED_LOCALES.filter(l => l !== 'en').join('|');

const baseRoutes = [
  {
    path: '',
    component: HomePage,
    meta: {
      canonicalPath: '',
      titleKey: 'home.mainTitle',
      descKey: 'home.whatIsDesc',
      robots: 'index, follow'
    }
  },
  {
    path: 'yes-no-wheel',
    component: YesNoWheelPage,
    meta: {
      canonicalPath: 'yes-no-wheel',
      titleKey: 'yesNoPage.title',
      descKey: 'yesNoPage.heroDesc',
      robots: 'index, follow',
      schema: {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "Is the Yes or No Wheel truly random?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes! Our wheel uses high-quality randomization algorithms to ensure that every spin is independent and fair. Every sliver of the wheel has an equal chance of winning based on the number of input sets you choose."
            }
          },
          {
            "@type": "Question",
            "name": "Can I customize the Yes No wheel?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Absolutely. You can choose between two-option (Yes/No) and three-option (Yes/No/Maybe) modes. You can also adjust the number of 'sets' on the wheel to change how it looks."
            }
          },
          {
            "@type": "Question",
            "name": "What is the 'Maybe' mode for?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "The 'Maybe' mode adds a third possibility for those tricky decisions that aren't strictly black and white. It's perfect for when you need a 'draw' or a 'wait and see' result."
            }
          }
        ]
      }
    }
  },
  {
    path: 'embed',
    component: EmbedWheelPage,
    meta: {
      titleKey: 'embed.settingsTitle',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'embed-yes-no',
    component: EmbedYesNoWheelPage,
    meta: {
      titleKey: 'embed.settingsTitle',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'configure-embed',
    component: EmbedConfigPage,
    meta: {
      titleKey: 'header.configureEmbed',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: 'wheel-of-names',
    component: WheelOfNamesPage,
    meta: {
      canonicalPath: 'wheel-of-names',
      titleKey: 'namesPage.title',
      descKey: 'namesPage.heroDesc',
      robots: 'index, follow'
    }
  },
  {
    path: 'food-wheel',
    component: FoodWheelPage,
    meta: {
      canonicalPath: 'food-wheel',
      titleKey: 'foodPage.title',
      descKey: 'foodPage.heroDesc',
      robots: 'index, follow'
    }
  },
  {
    path: 'spin-the-wheel',
    component: SpinTheWheelPage,
    meta: {
      canonicalPath: 'spin-the-wheel',
      titleKey: 'spinPage.title',
      descKey: 'spinPage.heroDesc',
      robots: 'index, follow'
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
  next();
});

// Navigation guard to dynamically update all SEO parameters post-navigation
router.afterEach((to) => {
  nextTick(() => {
    const locale = i18n.global.locale.value;
    const t = i18n.global.t;

    // Set Document Title
    if (to.meta.titleKey) {
      document.title = t(to.meta.titleKey) + ' | ' + t('footer.randoWheel');
    } else {
      document.title = t('footer.randoWheel');
    }

    // Set Document Description
    if (to.meta.descKey) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      // Trim string reliably for SEO length guidelines
      let descString = t(to.meta.descKey).replace(/<[^>]*>?/gm, '');
      metaDescription.content = descString.substring(0, 155) + (descString.length > 155 ? '...' : '');
    }

    // Process canonical metadata and Hreflang loop
    if (to.meta.canonicalPath !== undefined) {
      // 1. Set canonicalURL
      let canonicalLink = document.querySelector('link[rel="canonical"]');
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      const localePrefix = locale === 'en' ? '' : `/${locale}`;
      const pathSuffix = to.meta.canonicalPath ? `/${to.meta.canonicalPath}` : '';
      canonicalLink.href = `https://randowheel.com${localePrefix}${pathSuffix}`;

      // 2. Erase existing hreflangs and rebuild them for the entire language pool
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());

      SUPPORTED_LOCALES.forEach(lang => {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = lang;
        const prefix = lang === 'en' ? '' : `/${lang}`;
        link.href = `https://randowheel.com${prefix}${pathSuffix}`;
        document.head.appendChild(link);
      });

      // 3. Fallback globally
      const xDefault = document.createElement('link');
      xDefault.rel = 'alternate';
      xDefault.hreflang = 'x-default';
      xDefault.href = `https://randowheel.com${pathSuffix}`;
      document.head.appendChild(xDefault);
    }

    // Enforce Robot meta directions
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (!metaRobots) {
      metaRobots = document.createElement('meta');
      metaRobots.name = 'robots';
      document.head.appendChild(metaRobots);
    }
    metaRobots.content = to.meta.robots || 'index, follow';

    // Inject JSON-LD Schema
    document.querySelectorAll('script[type="application/ld+json"]').forEach(el => el.remove());
    if (to.meta.schema) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.text = JSON.stringify(to.meta.schema);
      document.head.appendChild(script);
    }
  });
});

const app = createApp(App);
app.use(router);
app.use(i18n);
app.mount('#app');
