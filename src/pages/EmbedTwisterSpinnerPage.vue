<template>
  <div class="embed-container">
    <VueWheelSpinner
      ref="spinner"
      v-if="slices.length > 0"
      :slices="slices"
      :winner-index="winnerIndex"
      :cursor-position="'edge'"
      :cursor-angle="90"
      :cursor-distance="-15"
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
    
    <button @click="resetWheel" class="reset-button">
      {{ $t('mainWheel.reset') }}
    </button>
  </div>
</template>

<script>
import VueWheelSpinner from '../components/VueWheelSpinner.vue';
import { ref } from 'vue';

export default {
  name: 'EmbedTwisterSpinnerPage',
  components: {
    VueWheelSpinner
  },
  setup() {
    const slices = ref([
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
    ]);
    const spinner = ref(null);
    const isSpinning = ref(false);
    const winnerIndex = ref(0);

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
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
  overflow: hidden;
  background-color: transparent;
}

.embed-container > :deep(.vue-wheel-spinner) {
  width: 100% !important;
  height: 100% !important;
  max-width: none !important;
  max-height: none !important;
}

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

:deep(.wheel-wrapper) {
  padding: 0;
  background: transparent;
  border-radius: 50%;
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
