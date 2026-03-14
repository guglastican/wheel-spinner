<template>
  <div class="embed-container">
    <YesNoWheel
      :initial-mode="mode"
      :initial-input-sets="sets"
      :is-embed="true"
    />
    
    <button @click="resetWheel" class="reset-button">
      {{ $t('mainWheel.reset') }}
    </button>
  </div>
</template>

<script setup>
import YesNoWheel from '../components/YesNoWheel.vue';
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const mode = ref('binary');
const sets = ref(4);

const parseConfigFromQuery = () => {
  if (route.query.mode) {
    mode.value = route.query.mode;
  }
  if (route.query.sets) {
    sets.value = parseInt(route.query.sets) || 4;
  }
};

const resetWheel = () => {
  window.location.reload();
};

onMounted(() => {
  parseConfigFromQuery();
});
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
  position: relative;
}

:deep(.yes-no-wheel-container) {
  max-width: 100% !important;
  width: 100% !important;
  height: 100% !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 15px !important;
}

:deep(.result-display) {
  margin-top: 20px;
}

:deep(.result-box) {
  width: 100px !important;
  height: 100px !important;
}

:deep(.result-count) {
  font-size: 40px !important;
}

:deep(.result-label) {
  font-size: 16px !important;
}

:deep(.wheel-wrapper) {
  width: 320px !important;
  height: 320px !important;
  padding: 0 !important;
  background: transparent !important;
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

/* Hide some elements for a cleaner embed if needed */
:deep(.spin-center-button) {
  width: 60px !important;
  height: 60px !important;
  font-size: 14px !important;
}
</style>
