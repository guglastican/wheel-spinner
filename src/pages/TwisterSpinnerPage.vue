<template>
  <div class="twister-spinner-page">
    <AppHeader :title="$t('twisterPage.title')" />

    <main class="main-content">
      <MainWheelSpinner :initial-slices="twisterSlices" />

      <section class="hero-section">
        <h1 class="hero-title">{{ $t('twisterPage.heroTitle') }}</h1>
        <p class="hero-description" v-html="$t('twisterPage.heroDesc')"></p>
      </section>

      <!-- Embed Generator Section -->
      <section class="embed-generator-section">
        <div class="section-card">
          <div class="section-header">
            <h3>{{ $t('embed.title') }}</h3>
            <p>{{ $t('embed.heroDesc') }}</p>
          </div>
          
          <div class="generator-controls">
            <div class="settings-grid">
              <div class="setting-item">
                <label>{{ $t('embed.titleLabel') }}</label>
                <input type="text" v-model="embedOptions.title" class="form-input">
              </div>
              <div class="setting-item">
                <label>{{ $t('embed.widthLabel') }}</label>
                <input type="number" v-model.number="embedOptions.width" class="form-input">
              </div>
              <div class="setting-item">
                <label>{{ $t('embed.heightLabel') }}</label>
                <input type="number" v-model.number="embedOptions.height" class="form-input">
              </div>
            </div>
            
            <button @click="generateEmbedCode" class="generate-btn">
              {{ $t('embed.generateBtn') }}
            </button>
          </div>

          <div v-if="embedCode" class="code-output-area">
            <div class="code-header">
              <span>{{ $t('embed.step3Title') }}</span>
              <button @click="copyToClipboard" class="copy-button" :class="{ success: copySuccess }">
                {{ copySuccess ? $t('embed.copied') : $t('embed.copyBtn') }}
              </button>
            </div>
            <textarea readonly v-model="embedCode" class="code-textarea"></textarea>
          </div>
        </div>
      </section>

      <section class="info-section">
        <h2>{{ $t('twisterPage.howToTitle') }}</h2>
        <ol class="steps-list">
          <li v-html="$t('twisterPage.steps.1')"></li>
          <li v-html="$t('twisterPage.steps.2')"></li>
          <li v-html="$t('twisterPage.steps.3')"></li>
          <li v-html="$t('twisterPage.steps.4')"></li>
        </ol>
      </section>

      <section class="seo-section">
        <h2>{{ $t('twisterPage.seoTitle') }}</h2>
        <p v-html="$t('twisterPage.seoDesc')"></p>
        <ul>
          <li v-html="$t('twisterPage.seoList.1')"></li>
          <li v-html="$t('twisterPage.seoList.2')"></li>
          <li v-html="$t('twisterPage.seoList.3')"></li>
        </ul>
      </section>

      <section class="seo-section seo-section--alt">
        <h2>{{ $t('twisterPage.whyTitle') }}</h2>
        <p v-html="$t('twisterPage.whyDesc')"></p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>{{ $t('twisterPage.features.1Title') }}</h3>
            <p v-html="$t('twisterPage.features.1Desc')"></p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">👀</div>
            <h3>{{ $t('twisterPage.features.2Title') }}</h3>
            <p v-html="$t('twisterPage.features.2Desc')"></p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎲</div>
            <h3>{{ $t('twisterPage.features.3Title') }}</h3>
            <p v-html="$t('twisterPage.features.3Desc')"></p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3>{{ $t('twisterPage.features.4Title') }}</h3>
            <p v-html="$t('twisterPage.features.4Desc')"></p>
          </div>
        </div>
      </section>

      <section class="seo-section">
        <h2>{{ $t('twisterPage.faqTitle') }}</h2>
        <div class="faq-list">
          <details class="faq-item">
            <summary><h3>{{ $t('twisterPage.faqs.1Title') }}</h3></summary>
            <p v-html="$t('twisterPage.faqs.1Desc')"></p>
          </details>
          <details class="faq-item">
            <summary><h3>{{ $t('twisterPage.faqs.2Title') }}</h3></summary>
            <p v-html="$t('twisterPage.faqs.2Desc')"></p>
          </details>
          <details class="faq-item">
            <summary><h3>{{ $t('twisterPage.faqs.3Title') }}</h3></summary>
            <p v-html="$t('twisterPage.faqs.3Desc')"></p>
          </details>
        </div>
      </section>

      <section class="seo-section seo-section--alt">
        <h2>{{ $t('twisterPage.article.sec1Title') }}</h2>
        <p v-html="$t('twisterPage.article.sec1Text')"></p>
      </section>

      <section class="seo-section">
        <h2>{{ $t('twisterPage.article.sec2Title') }}</h2>
        <p v-html="$t('twisterPage.article.sec2Text')"></p>
      </section>

      <section class="seo-section seo-section--alt">
        <h2>{{ $t('twisterPage.article.sec3Title') }}</h2>
        <p>
          {{ $t('twisterPage.article.sec3TextStart') }}
          <router-link :to="localePath('/wheel-of-names')" class="inline-link">{{ $t('twisterPage.article.sec3LinkText') }}</router-link>
          {{ $t('twisterPage.article.sec3TextMiddle') }}
          <router-link :to="localePath('/wheel-of-names')" class="inline-link">{{ $t('twisterPage.article.sec3LinkText2') }}</router-link>
          {{ $t('twisterPage.article.sec3TextEnd') }}
        </p>
      </section>

      <section class="seo-section">
        <h2>{{ $t('twisterPage.article.sec4Title') }}</h2>
        <p>
          {{ $t('twisterPage.article.sec4TextStart') }}
          <router-link :to="localePath('/food-wheel')" class="inline-link">{{ $t('twisterPage.article.sec4LinkText') }}</router-link>
          {{ $t('twisterPage.article.sec4TextMiddle') }}
          <router-link :to="localePath('/food-wheel')" class="inline-link">{{ $t('twisterPage.article.sec4LinkText2') }}</router-link>
          {{ $t('twisterPage.article.sec4TextEnd') }}
        </p>
      </section>

      <section class="seo-section seo-section--alt">
        <h2>{{ $t('twisterPage.article.sec5Title') }}</h2>
        <p>
          {{ $t('twisterPage.article.sec5TextStart') }}
          <router-link :to="localePath('/yes-no-wheel')" class="inline-link">{{ $t('twisterPage.article.sec5LinkText') }}</router-link>
          {{ $t('twisterPage.article.sec5TextMiddle') }}
          <router-link :to="localePath('/yes-no-wheel')" class="inline-link">{{ $t('twisterPage.article.sec5LinkText2') }}</router-link>
          {{ $t('twisterPage.article.sec5TextEnd') }}
        </p>
      </section>

      <section class="seo-section">
        <h2>{{ $t('twisterPage.article.sec6Title') }}</h2>
        <p>
          {{ $t('twisterPage.article.sec6TextStart') }}
          <router-link :to="localePath('/')" class="inline-link">{{ $t('twisterPage.article.sec6LinkText') }}</router-link>
          {{ $t('twisterPage.article.sec6TextMiddle') }}
          <router-link :to="localePath('/')" class="inline-link">{{ $t('twisterPage.article.sec6LinkText2') }}</router-link>
          {{ $t('twisterPage.article.sec6TextEnd') }}
        </p>
      </section>

      <section class="related-tools-section">
        <h2>{{ $t('exploreMore.title') }}</h2>
        <p>{{ $t('exploreMore.descDefault') }}</p>
        <div class="tool-cards">
          <router-link :to="localePath('/')" class="tool-card">
            <div class="tool-card-icon">🎡</div>
            <h3>{{ $t('exploreMore.rwTitle') }}</h3>
            <p>{{ $t('exploreMore.rwDesc') }}</p>
          </router-link>
          <router-link :to="localePath('/wheel-of-names')" class="tool-card">
            <div class="tool-card-icon">👩‍🏫</div>
            <h3>{{ $t('exploreMore.wonTitle') }}</h3>
            <p>{{ $t('exploreMore.wonDesc') }}</p>
          </router-link>
          <router-link :to="localePath('/food-wheel')" class="tool-card">
            <div class="tool-card-icon">🍔</div>
            <h3>{{ $t('header.foodWheel') }}</h3>
            <p>{{ $t('exploreMore.descFood') || 'Unsure what to eat? Spin the food wheel for quick random meal decisions.' }}</p>
          </router-link>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import { onMounted, ref, reactive } from 'vue';
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

const embedCode = ref('');
const copySuccess = ref(false);

const embedOptions = reactive({
  title: 'Twister Spinner',
  width: 500,
  height: 500,
});

const generateEmbedCode = () => {
  const embedUrl = `${window.location.origin}/embed-twister-spinner`;
  
  embedCode.value = `<iframe
  src="${embedUrl}"
  width="${embedOptions.width}"
  height="${embedOptions.height}"
  frameborder="0"
  scrolling="no"
  style="border:none; overflow:hidden;"
  title="${embedOptions.title}">
</iframe>`;
};

const copyToClipboard = async () => {
  if (!embedCode.value) return;
  try {
    await navigator.clipboard.writeText(embedCode.value);
    copySuccess.value = true;
    setTimeout(() => {
      copySuccess.value = false;
    }, 2000);
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
};

const twisterSlices = [
  { color: '#ff4136', text: 'Right Hand', winCount: 0 },
  { color: '#0074d9', text: 'Left Foot', winCount: 0 },
  { color: '#ffdc00', text: 'Left Hand', winCount: 0 },
  { color: '#2ecc40', text: 'Right Foot', winCount: 0 },
  { color: '#ff4136', text: 'Left Foot', winCount: 0 },
  { color: '#0074d9', text: 'Left Hand', winCount: 0 },
  { color: '#ffdc00', text: 'Right Foot', winCount: 0 },
  { color: '#2ecc40', text: 'Right Hand', winCount: 0 },
  { color: '#ff4136', text: 'Left Hand', winCount: 0 },
  { color: '#0074d9', text: 'Right Foot', winCount: 0 },
  { color: '#ffdc00', text: 'Right Hand', winCount: 0 },
  { color: '#2ecc40', text: 'Left Foot', winCount: 0 },
  { color: '#ff4136', text: 'Right Foot', winCount: 0 },
  { color: '#0074d9', text: 'Right Hand', winCount: 0 },
  { color: '#ffdc00', text: 'Left Foot', winCount: 0 },
  { color: '#2ecc40', text: 'Left Hand', winCount: 0 }
];

// Update meta tags for SEO when the component mounts
onMounted(() => {
  // Title is handled by the router guard in main.js
  const existingScript = document.getElementById('twister-spinner-schema');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'twister-spinner-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Twister Spinner",
    "url": "https://randowheel.com/twister-spinner",
    "description": "Lost your Twister spinner? Use our free online Twister Spinner to call out moves for your game! Just hit spin, and get instant random commands like 'Left Hand Blue' or 'Right Foot Red'.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Instantly generates Twister moves",
      "Fair and random spinning algorithm",
      "Works on mobile and desktop",
      "No downloads required"
    ]
  });
  document.head.appendChild(script);
});
</script>

<style scoped>
.twister-spinner-page {
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

/* ── Embed Generator Styles ── */
.embed-generator-section {
  max-width: 820px;
  margin: 0 auto 40px;
  width: 100%;
}

.section-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
  border: 1px solid #e2e8f0;
}

.section-header {
  margin-bottom: 25px;
  text-align: center;
}

.section-header h3 {
  font-size: 1.8rem;
  color: #1a1a2e;
  margin-bottom: 8px;
}

.section-header p {
  color: #64748b;
  font-size: 1rem;
}

.generator-controls {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 15px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.setting-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.9rem;
}

.form-input {
  padding: 10px 14px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  background-color: #f8fafc;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #6c5ce7;
}

.generate-btn {
  background: linear-gradient(135deg, #6c5ce7, #8a4af3);
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.2);
}

.generate-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 15px rgba(108, 92, 231, 0.3);
}

.code-output-area {
  margin-top: 30px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.code-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.code-header span {
  font-weight: 600;
  color: #2d3748;
}

.copy-button {
  background-color: #edf2f7;
  color: #4a5568;
  border: 1px solid #cbd5e1;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.copy-button:hover {
  background-color: #e2e8f0;
}

.copy-button.success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.code-textarea {
  width: 100%;
  min-height: 120px;
  padding: 15px;
  background-color: #1e293b;
  color: #e2e8f0;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9rem;
  resize: vertical;
  line-height: 1.5;
  border: none;
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

/* ── FAQ ── */
.faq-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.faq-item {
  background: #fafafa;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 15px 20px;
  cursor: pointer;
}

.faq-item summary {
  font-weight: bold;
  font-size: 1.1rem;
  color: #333;
  outline: none;
}

.faq-item summary h3 {
  display: inline;
  margin: 0;
  font-size: 1.1rem;
}

.faq-item p {
  margin-top: 10px;
  margin-bottom: 0;
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
