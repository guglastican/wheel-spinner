<template>
  <div class="embed-config-page">
    <AppHeader :title="$t('home.mainTitle')" />

    <main class="main-content">
      <!-- Main Interactive Wheel (same as Home Page) -->
      <div class="main-wheel-section">
        <MainWheelSpinner ref="wheelConfigurator" />
      </div>

      <div class="tutorial-steps">
        <section class="hero-section text-center">
          <h1 class="page-title">{{ $t('embed.title') }}</h1>
          <p class="hero-description">{{ $t('embed.heroDesc') }}</p>
        </section>


        <!-- Step 1: Settings -->
        <section class="tutorial-step">
          <div class="step-header">
            <span class="step-number">1</span>
            <h2 class="step-title">{{ $t('embed.step2Title') }}</h2>
          </div>
          <p class="step-description">{{ $t('embed.step2Desc') }}</p>

          <div class="step-content settings-content control-section">
            <div class="settings-grid">
              <div class="setting-group">
                <label for="embedTitle">{{ $t('embed.titleLabel') }}</label>
                <input type="text" id="embedTitle" v-model="embedOptions.title" class="form-control">
              </div>
              <div class="setting-group">
                <label for="embedWidth">{{ $t('embed.widthLabel') }}</label>
                <input type="number" id="embedWidth" v-model.number="embedOptions.width" class="form-control" min="50">
              </div>
              <div class="setting-group">
                <label for="embedHeight">{{ $t('embed.heightLabel') }}</label>
                <input type="number" id="embedHeight" v-model.number="embedOptions.height" class="form-control" min="50">
              </div>
            </div>
          </div>
        </section>

        <!-- Step 2: Embed Code and Live Preview -->
        <section class="tutorial-step">
          <div class="step-header">
            <span class="step-number">2</span>
            <h2 class="step-title">{{ $t('embed.step3Title') }}</h2>
          </div>
          <p class="step-description">{{ $t('embed.step3Desc') }}</p>

          <div class="step-content code-content control-section">
            <div class="code-actions">
              <button @click="generateEmbedCode" class="btn btn-primary d-block w-100 mb-3">{{ $t('embed.generateBtn') }}</button>
            </div>
            
            <div class="code-preview-grid" v-if="embedCode">
              <div class="code-box-wrapper">
                <textarea v-model="embedCode" readonly class="embed-code-area" ref="codeArea"></textarea>
                <button @click="copyToClipboard" class="btn btn-success copy-btn">
                  <span>{{ copySuccess ? $t('embed.copied') : $t('embed.copyBtn') }}</span>
                </button>
              </div>
              <div class="live-preview-wrapper" v-if="iframeSrc">
                <h3>Live Preview</h3>
                <div class="iframe-container" :style="{ width: embedOptions.width + 'px', height: embedOptions.height + 'px' }">
                    <iframe
                      :src="iframeSrc"
                      :width="embedOptions.width"
                      :height="embedOptions.height"
                      frameborder="0"
                      scrolling="no"
                      style="border:none; overflow:hidden;"
                      :title="embedOptions.title">
                    </iframe>
                </div>
              </div>
            </div>
            <div v-else class="empty-code-placeholder">
              {{ $t('embed.instructions') }}
            </div>
            <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue';
import { useI18n } from 'vue-i18n';

const wheelConfigurator = ref(null);
const embedCode = ref('');
const iframeSrc = ref('');
const errorMessage = ref('');
const codeArea = ref(null);
const copySuccess = ref(false);

const embedOptions = reactive({
  title: 'Random Wheel Spinner',
  width: 400,
  height: 400,
});
const { t } = useI18n();

const generateEmbedCode = () => {
  errorMessage.value = '';
  copySuccess.value = false;

  if (!wheelConfigurator.value || !wheelConfigurator.value.slices) {
    console.error("Wheel configurator component or its slices not available.");
    errorMessage.value = t('embed.errConfigure');
    return;
  }

  const currentSlices = wheelConfigurator.value.slices;
  const configData = currentSlices.filter(slice => slice.included !== false).map(slice => ({
    text: slice.text,
    color: slice.color
  }));

  if (configData.length === 0) {
      errorMessage.value = t('embed.errEmpty');
      embedCode.value = '';
      return;
  }

  const configString = JSON.stringify(configData);
  const encodedConfig = encodeURIComponent(configString);
  const embedUrl = `${window.location.origin}/embed?config=${encodedConfig}`;
  
  iframeSrc.value = embedUrl;
  
  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${embedOptions.width}"
  height="${embedOptions.height}"
  frameborder="0"
  scrolling="no"
  style="border:none; overflow:hidden;"
  title="${embedOptions.title}">
</iframe>`;

  embedCode.value = iframeCode;
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
    console.error('Failed to copy text: ', err);
    // Fallback logic
    if (codeArea.value) {
      codeArea.value.select();
      document.execCommand('copy');
      copySuccess.value = true;
      setTimeout(() => {
        copySuccess.value = false;
      }, 2000);
    }
  }
};
</script>

<style scoped>
.embed-config-page {
  font-family: Arial, sans-serif;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
  padding: 20px;
  background-color: #f7f9fc;
}

.main-content {
  flex: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 10px 0 40px 0;
  width: 100%;
  box-sizing: border-box;
}

.hero-section {
  text-align: center;
  margin: 30px 0;
  padding: 0 20px;
}

.main-wheel-section {
  margin-bottom: 50px;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1a1a2e;
  margin-bottom: 15px;
  letter-spacing: -0.02em;
}

.hero-description {
  font-size: 1.15rem;
  color: #4a5568;
  max-width: 700px;
  margin: 0 auto;
  line-height: 1.6;
}

/* Tutorial Steps */
.tutorial-steps {
  display: flex;
  flex-direction: column;
  gap: 40px;
}

.tutorial-step {
  background: transparent;
  padding: 0;
}

.step-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.step-number {
  background: linear-gradient(135deg, #6a29e3, #4a148c);
  color: white;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  margin-right: 15px;
  box-shadow: 0 4px 10px rgba(106, 41, 227, 0.3);
}

.step-title {
  font-size: 1.8rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
}

.step-description {
  font-size: 1.05rem;
  color: #64748b;
  margin-left: 60px;
  margin-bottom: 25px;
  line-height: 1.5;
}

.step-content {
  margin-left: 60px;
}

/* Specific Content Styles */
.wheel-step {
  margin-left: 0; /* Let the wheel take full width */
  margin-top: 20px;
}

.control-section {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.setting-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.setting-group label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.95rem;
}

.form-control {
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.2s ease;
  background-color: #f8fafc;
}

.form-control:focus {
  outline: none;
  border-color: #6a29e3;
  box-shadow: 0 0 0 3px rgba(106, 41, 227, 0.15);
  background-color: #fff;
}

/* Code Area */
.code-actions {
  margin-bottom: 20px;
}

.btn {
  font-weight: 600;
  border-radius: 8px;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 1rem;
  border: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: linear-gradient(135deg, #6a29e3, #8a4af3);
  color: white;
  box-shadow: 0 4px 12px rgba(106, 41, 227, 0.25);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(106, 41, 227, 0.35);
}

.btn-success {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
}

.btn-success:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.3);
}

.w-100 {
  width: 100%;
}

.code-box-wrapper {
  position: relative;
  margin-top: 15px;
}

.embed-code-area {
  width: 100%;
  min-height: 150px;
  padding: 20px 20px 60px 20px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.95rem;
  resize: vertical;
  background-color: #1e293b;
  color: #e2e8f0;
  white-space: pre;
  overflow-wrap: break-word;
  box-sizing: border-box;
  line-height: 1.5;
}

.copy-btn {
  position: absolute;
  bottom: 20px;
  right: 20px;
  padding: 8px 16px;
  font-size: 0.9rem;
}

.empty-code-placeholder {
  text-align: center;
  padding: 40px 20px;
  background-color: #f1f5f9;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-style: italic;
}

.error-message {
  color: #ef4444;
  margin-top: 15px;
  font-weight: 500;
  text-align: center;
  padding: 10px;
  background-color: #fef2f2;
  border-radius: 8px;
  border: 1px solid #fecaca;
}

.code-preview-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 30px;
  margin-top: 20px;
}

.live-preview-wrapper {
  background: #f8fafc;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.live-preview-wrapper h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #4a5568;
  font-size: 1.1rem;
}

.iframe-container {
  background-color: #ffffff;
  border: 1px dashed #a0aec0;
  border-radius: 4px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 900px) {
  .code-preview-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .step-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .step-number {
    margin-bottom: 15px;
  }
  
  .step-description {
    margin-left: 0;
  }
  
  .step-content {
    margin-left: 0;
  }
  
  .page-title {
    font-size: 2rem;
  }
}
</style>
