<template>
  <div class="spin-wheel-page">
    <AppHeader :title="$t('spinPage.title')" />

    <main class="main-content">
      <MainWheelSpinner />

      <section class="hero-section">
        <h1 class="hero-title">{{ $t('spinPage.heroTitle') }}</h1>
        <p class="hero-description" v-html="$t('spinPage.heroDesc')"></p>
      </section>

      <section class="info-section">
        <h2>{{ $t('spinPage.howToTitle') }}</h2>
        <ol class="steps-list">
          <li v-html="$t('spinPage.steps.1')"></li>
          <li v-html="$t('spinPage.steps.2')"></li>
          <li v-html="$t('spinPage.steps.3')"></li>
          <li v-html="$t('spinPage.steps.4')"></li>
          <li v-html="$t('spinPage.steps.5')"></li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>{{ $t('spinPage.seoTitle') }}</h2>
        <p v-html="$t('spinPage.seoDesc')"></p>
        <ul>
          <li v-html="$t('spinPage.seoList.1')"></li>
          <li v-html="$t('spinPage.seoList.2')"></li>
          <li v-html="$t('spinPage.seoList.3')"></li>
          <li v-html="$t('spinPage.seoList.4')"></li>
        </ul>
      </section>

      <section class="seo-section seo-section--alt">
        <h2>{{ $t('spinPage.whyTitle') }}</h2>
        <p>{{ $t('spinPage.whyDesc') }}</p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">⚙️</div>
            <h3>{{ $t('spinPage.features.1Title') }}</h3>
            <p>{{ $t('spinPage.features.1Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>{{ $t('spinPage.features.2Title') }}</h3>
            <p>{{ $t('spinPage.features.2Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💾</div>
            <h3>{{ $t('spinPage.features.3Title') }}</h3>
            <p>{{ $t('spinPage.features.3Desc') }}</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎲</div>
            <h3>{{ $t('spinPage.features.4Title') }}</h3>
            <p>{{ $t('spinPage.features.4Desc') }}</p>
          </div>
        </div>
      </section>

      <section class="related-tools-section">
        <h2>{{ $t('exploreMore.title') }}</h2>
        <p>{{ $t('exploreMore.descDefault') }}</p>
        <div class="tool-cards">
          <router-link :to="localePath('/wheel-of-names')" class="tool-card">
            <div class="tool-card-icon">👩‍🏫</div>
            <h3>{{ $t('exploreMore.wonTitle') }}</h3>
            <p>{{ $t('exploreMore.wonDesc') }}</p>
          </router-link>
          <router-link :to="localePath('/yes-no-wheel')" class="tool-card">
            <div class="tool-card-icon">✅</div>
            <h3>{{ $t('exploreMore.ynwTitle') }}</h3>
            <p>{{ $t('exploreMore.ynwDesc') }}</p>
          </router-link>
          <router-link :to="localePath('/food-wheel')" class="tool-card">
            <div class="tool-card-icon">🍔</div>
            <h3>{{ $t('exploreMore.foodTitle') || 'Food Wheel' }}</h3>
            <p>{{ $t('exploreMore.foodDesc') || 'Unsure what to eat? Spin the food wheel for quick random meal decisions.' }}</p>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const localePath = (path) => {
  const currentLang = locale.value;
  if (currentLang === 'en') return path;
  if (path === '/') return `/${currentLang}`;
  return `/${currentLang}${path}`;
};

// Update meta tags for SEO when the component mounts
onMounted(() => {
  // Title is handled by the router guard in main.js
  const existingScript = document.getElementById('spin-wheel-schema');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'spin-wheel-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Spin the Wheel — Custom Random Picker",
    "url": "https://randowheel.com/spin-the-wheel",
    "description": "Create your own custom Spin the Wheel to make decisions, play games, or pick a random winner. Enter your choices, spin the wheel, and let the fun begin!",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Add unlimited custom options",
      "Customise slice colours",
      "Fully random spinning algorithm",
      "Track results",
      "Works on mobile and desktop"
    ]
  });
  document.head.appendChild(script);
});
</script>

<style scoped>
.spin-wheel-page {
  font-family: Arial, sans-serif;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
  padding: 20px;
}

/* ── Inline anchor links ── */
.inline-link {
  color: #6c5ce7;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.inline-link:hover {
  color: #4a3dbd;
  text-decoration-thickness: 2px;
}

/* ── Hero ── */
.hero-section {
  text-align: center;
  max-width: 820px;
  margin: 0 auto 40px;
}

.hero-title {
  font-size: 2.4rem;
  color: #6c5ce7;
  margin-bottom: 16px;
  line-height: 1.2;
  animation: fadeInDown 0.5s ease-out;
}

.hero-description {
  font-size: 1.15rem;
  color: #555;
  line-height: 1.7;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── How To section ── */
.info-section {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  max-width: 820px;
  margin: 40px auto 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.info-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 18px;
}

.steps-list {
  padding-left: 22px;
  counter-reset: step-counter;
}

.steps-list li {
  margin-bottom: 12px;
  line-height: 1.65;
  color: #444;
  font-size: 1rem;
}

/* ── Generic SEO sections ── */
.seo-section {
  max-width: 820px;
  margin: 40px auto 0;
  padding: 30px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.seo-section--alt {
  background: #f9f9f9;
}

.seo-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 16px;
}

.seo-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 24px 0 10px;
}

.seo-section p {
  color: #555;
  line-height: 1.75;
  margin-bottom: 14px;
  font-size: 1rem;
}

.seo-section ul {
  list-style: disc;
  padding-left: 24px;
  margin-bottom: 14px;
}

.seo-section li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #555;
  font-size: 1rem;
}

/* ── Feature grid ── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: #fff;
  border: 1px solid #e8e0ff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.12);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature-card h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* ── Related tools ── */
.related-tools-section {
  max-width: 820px;
  margin: 40px auto 0;
  padding: 30px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.related-tools-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 12px;
}

.related-tools-section > p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 24px;
}

.tool-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.tool-card {
  display: block;
  background: #f5f0ff;
  border: 2px solid #e0d4ff;
  border-radius: 10px;
  padding: 24px 20px;
  text-decoration: none;
  transition: all 0.25s ease;
  color: inherit;
}

.tool-card:hover {
  background: #ede5ff;
  border-color: #6c5ce7;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.15);
}

.tool-card-icon {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.tool-card h3 {
  font-size: 1.05rem;
  color: #6c5ce7;
  margin: 0 0 8px;
}

.tool-card p {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.7rem;
  }

  .info-section,
  .seo-section,
  .related-tools-section {
    padding: 20px;
    margin: 24px auto 0;
  }

  .feature-grid,
  .tool-cards {
    grid-template-columns: 1fr;
  }
}
</style>
