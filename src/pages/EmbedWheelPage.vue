<template>
  <div class="embed-container">
    <VueWheelSpinner
      ref="spinner"
      v-if="slices.length > 0"
      :slices="slices"
      :winner-index="winnerIndex"
      :cursor-position="'edge'"
      :cursor-angle="90"
      :cursor-distance="5"
      :sounds="{
        spinning: '/sounds/tick.mp3',
        won: '/sounds/win.mp3'
      }"
      @spin-start="onSpinStart"
      @spin-end="onSpinEnd"
    >
      <template #cursor>
        <div style="width: 30px; height: 40px; transform: rotate(180deg);">
          <svg viewBox="0 0 24 24" style="width: 100%; height: 100%; filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4));">
            <!-- Teardrop shape -->
            <path d="M12 2 C12 2, 2 16, 2 22 C2 28, 22 28, 22 22 C22 16, 12 2, 12 2 Z" fill="#8250df" />
            <!-- Inner circle -->
            <circle cx="12" cy="20" r="4" fill="white" />
          </svg>
        </div>
      </template>

      <template #default>
        <button
          @click="spinWheel"
          :disabled="isSpinning"
          class="spin-center-button"
        >
          {{ $t('mainWheel.spin') }}
        </button>
      </template>
    </VueWheelSpinner>
    
    <button v-if="slices.length > 0" @click="resetWheel" class="reset-button">
      {{ $t('mainWheel.reset') }}
    </button>

    <div v-else class="loading-message">
      {{ $t('embed.loading') }}
    </div>
  </div>
</template>

<script>
import VueWheelSpinner from '../components/VueWheelSpinner.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

export default {
  name: 'EmbedWheelPage',
  components: {
    VueWheelSpinner
  },
  setup() {
    const route = useRoute();
    const slices = ref([]);
    const spinner = ref(null);
    const isSpinning = ref(false);
    const winnerIndex = ref(0);

    const parseConfigFromQuery = () => {
      const choicesParam = route.query.choices;
      const colorsParam = route.query.colors;
      const configParam = route.query.config;

      if (choicesParam) {
        // Handle simplified comma-separated format
        const choiceList = choicesParam.split(',');
        const colorList = colorsParam ? colorsParam.split(',') : [];

        slices.value = choiceList.map((choice, index) => ({
          text: choice.trim(),
          color: colorList[index] ? (colorList[index].startsWith('#') ? colorList[index] : '#' + colorList[index]) : getRandomColor()
        }));
      } else if (configParam) {
        // Handle legacy JSON format
        try {
          const decodedConfig = decodeURIComponent(configParam);
          const parsedSlices = JSON.parse(decodedConfig);

          if (Array.isArray(parsedSlices)) {
            slices.value = parsedSlices.map(slice => ({
              color: slice.color || getRandomColor(),
              text: slice.text || '?',
            }));
          } else {
            slices.value = getDefaultSlices();
          }
        } catch (error) {
          console.error("Error parsing embed config:", error);
          slices.value = getDefaultSlices();
        }
      } else {
        slices.value = getDefaultSlices();
      }
    };

    const getRandomColor = () => {
      return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
    };

    const getDefaultSlices = () => {
      // Provide a default simple wheel if config is missing or invalid
      return [
        { color: '#FF0000', text: 'Option 1' },
        { color: '#00FF00', text: 'Option 2' },
        { color: '#0000FF', text: 'Option 3' },
      ];
    };

    const spinWheel = () => {
      if (isSpinning.value) return;
      
      const randomIndex = Math.floor(Math.random() * slices.value.length);
      winnerIndex.value = randomIndex;
      spinner.value.spinWheel(randomIndex);
    };

    const onSpinStart = () => {
      isSpinning.value = true;
    };

    const onSpinEnd = (index) => {
      isSpinning.value = false;
    };

    const resetWheel = () => {
      if (isSpinning.value) return;
      window.location.reload(); 
    };

    onMounted(() => {
      parseConfigFromQuery();
    });

    return {
      slices,
      spinner,
      isSpinning,
      winnerIndex,
      spinWheel,
      onSpinStart,
      onSpinEnd,
      resetWheel
    };
  }
}
</script>

<style scoped>
.embed-container {
  /* Ensure the container takes full available space */
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* Remove padding */
  margin: 0; /* Remove margin */
  overflow: hidden; /* Prevent scrollbars within the embed itself */
  background-color: transparent; /* Make background transparent */
}

/* Ensure the wheel component itself fills the container */
.embed-container > :deep(.vue-wheel-spinner) { /* Use :deep to target child */
  width: 100% !important;
  height: 100% !important;
  max-width: none !important; /* Override any max-width */
  max-height: none !important; /* Override any max-height */
}

/* Match the screenshot center button style */
.spin-center-button {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  background: linear-gradient(145deg, #348fcb, #2980b9);
  border: 4px solid #ffffff;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  z-index: 20;
}

.spin-center-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
}

.spin-center-button:active:not(:disabled) {
  transform: scale(0.95);
}

.spin-center-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.8;
}

.loading-message {
  font-family: sans-serif;
  color: #555;
}

/* White circle around wheel */
:deep(.wheel-wrapper) {
  padding: 18px;
  background: #ffffff;
  border-radius: 50%;
  margin-top: -20px;
}

:deep(canvas) {
  border: none;
  border-radius: 50%;
}

.reset-button {
  position: absolute;
  bottom: 20px;
  left: 20px;
  background: #f1f5f9;
  border: 1px solid #cbd5e1;
  color: #475569;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 30;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.reset-button:hover {
  background: #e2e8f0;
  color: #1e293b;
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.reset-button:active {
  transform: translateY(0);
}
</style>
