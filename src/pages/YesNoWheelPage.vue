<template>
  <div class="yes-no-wheel-page">
    <AppHeader :title="$t('yesNoPage.title')" />

    <main class="main-content">
      <section class="intro-section">
        <h2>{{ $t('yesNoPage.heroTitle') }}</h2>
        <p v-html="$t('yesNoPage.heroDesc')"></p>
      </section>

      <YesNoWheel ref="yesNoWheelRef" />

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
        <h3>{{ $t('yesNoPage.howToTitle') }}</h3>
        <ol>
          <li v-html="$t('yesNoPage.steps.1')"></li>
          <li v-html="$t('yesNoPage.steps.2')"></li>
          <li v-html="$t('yesNoPage.steps.3')"></li>
          <li v-html="$t('yesNoPage.steps.4')"></li>
          <li v-html="$t('yesNoPage.steps.5')"></li>
        </ol>
      </section>

      <section class="seo-content-section">
        <h3>{{ $t('yesNoPage.seoTitle') }}</h3>
        <p v-html="$t('yesNoPage.seoDesc1')"></p>
        <ul>
          <li v-html="$t('yesNoPage.seoList.1')"></li>
          <li v-html="$t('yesNoPage.seoList.2')"></li>
          <li v-html="$t('yesNoPage.seoList.3')"></li>
          <li v-html="$t('yesNoPage.seoList.4')"></li>
        </ul>
        <p v-html="$t('yesNoPage.seoDesc2')"></p>
      </section>

      <section class="more-content-section">
        <h3>{{ $t('yesNoPage.moreTitle') }}</h3>
        <p>{{ $t('yesNoPage.moreDesc') }}</p>
        <ul>
          <li v-html="$t('yesNoPage.moreList.1')"></li>
          <li v-html="$t('yesNoPage.moreList.2')"></li>
          <li v-html="$t('yesNoPage.moreList.3')"></li>
          <li v-html="$t('yesNoPage.moreList.4')"></li>
        </ul>
        <h3>{{ $t('yesNoPage.powerTitle') }}</h3>
        <p v-html="$t('yesNoPage.powerDesc')"></p>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2 class="section-title">{{ $t('yesNoPage.faqTitle') }}</h2>
        <div class="faq-container">
          <div v-for="n in 5" :key="n" class="faq-item">
            <h3 class="faq-question">{{ $t(`yesNoPage.faqs.${n}Title`) }}</h3>
            <p class="faq-answer">{{ $t(`yesNoPage.faqs.${n}Desc`) }}</p>
          </div>
        </div>
      </section>

    </main>

  </div>
</template>

<script setup>
// Using script setup again, but without useHead due to previous issues
import { ref, reactive } from 'vue';
import YesNoWheel from '../components/YesNoWheel.vue';
import AppHeader from '../components/AppHeader.vue';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const yesNoWheelRef = ref(null);
const embedCode = ref('');
const copySuccess = ref(false);

const embedOptions = reactive({
  title: 'Yes or No Wheel',
  width: 500,
  height: 500,
});

const generateEmbedCode = () => {
  if (!yesNoWheelRef.value) return;
  
  const mode = yesNoWheelRef.value.mode;
  const sets = yesNoWheelRef.value.inputSets;
  
  const embedUrl = `${window.location.origin}/embed-yes-no?mode=${mode}&sets=${sets}`;
  
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
</script>

<style scoped>
.yes-no-wheel-page {
  font-family: Arial, sans-serif;
  max-width: 100%; /* Use 100% instead of fixed max-width */
  overflow-x: hidden; /* Prevent horizontal scroll */
  margin: 0 auto;
  padding: 20px;
}

/* REMOVED Header, Logo, Navigation styles - now in AppHeader.vue */

.main-content {
  display: center;
  flex-direction: column;
  gap: 40px;
}

.intro-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.intro-section h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
}

.intro-section p {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
}

.info-section {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.info-section h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.info-section ol {
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #555;
}

.footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
}

/* Embed Generator Styles */
.embed-generator-section {
  max-width: 800px;
  margin: 40px auto;
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
/* SEO Content Sections */
.seo-content-section, .more-content-section {
  max-width: 800px;
  margin: 40px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
}

.seo-content-section h3, .more-content-section h3 {
  font-size: 1.8rem;
  color: #1a1a2e;
  margin-bottom: 20px;
}

.seo-content-section p, .more-content-section p {
  line-height: 1.8;
  color: #475569;
  margin-bottom: 20px;
}

.seo-content-section ul, .more-content-section ul {
  list-style: none;
  padding: 0;
  margin-bottom: 20px;
}

.seo-content-section li, .more-content-section li {
  padding-left: 28px;
  position: relative;
  margin-bottom: 12px;
  line-height: 1.6;
  color: #475569;
}

.seo-content-section li::before, .more-content-section li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: #6c5ce7;
  font-weight: bold;
}

/* FAQ Section Styles */
.faq-section {
  max-width: 800px;
  margin: 60px auto;
  padding: 0 20px;
}

.section-title {
  text-align: center;
  font-size: 2.2rem;
  color: #1a1a2e;
  margin-bottom: 40px;
}

.faq-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.faq-item {
  background: #ffffff;
  border-radius: 12px;
  padding: 25px;
  border: 1px solid #e2e8f0;
  transition: transform 0.2s, box-shadow 0.2s;
}

.faq-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.faq-question {
  font-size: 1.25rem;
  color: #1e293b;
  margin-bottom: 12px;
  font-weight: 700;
}

.faq-answer {
  line-height: 1.7;
  color: #64748b;
  font-size: 1.05rem;
}
</style>
