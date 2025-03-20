<template>
  <div class="yes-no-wheel-container">
    <div class="result-display">
      <div class="result-box yes" :class="{ active: lastResult === 'yes' }">
        <div class="result-count">{{ results.yes }}</div>
        <div class="result-label">YES</div>
      </div>
      <div class="result-box no" :class="{ active: lastResult === 'no' }">
        <div class="result-count">{{ results.no }}</div>
        <div class="result-label">NO</div>
      </div>
      <div v-if="mode === 'ternary'" class="result-box maybe" :class="{ active: lastResult === 'maybe' }">
        <div class="result-count">{{ results.maybe }}</div>
        <div class="result-label">MAYBE</div>
      </div>
    </div>

    <div class="wheel-container">
      <div class="wheel-wrapper">
        <VueWheelSpinner 
          ref="spinner"
          :slices="wheelSlices"
          :winner-index="winnerIndex"
          :cursor-position="cursorPosition"
          :cursor-angle="cursorAngle"
          @spin-start="onSpinStart"
          @spin-end="onSpinEnd">
          
          <template #cursor>
            <div style="width: 30px; height: 40px;">
              <svg viewBox="0 0 24 32" style="width: 100%; height: 100%; filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4));">
                <path d="M12 2 C12 2, 2 16, 2 22 C2 28, 22 28, 22 22 C22 16, 12 2, 12 2 Z" fill="#e74c3c" />
                <path d="M12 4 C12 4, 4 16, 4 21 C4 24, 10 26, 16 24 C10 26, 6 22, 6 19 C6 14, 12 4, 12 4 Z" fill="#f8c9c5" opacity="0.6" />
                <circle cx="12" cy="20" r="4" fill="white" />
              </svg>
            </div>
          </template>
          
          <template #default>
            <button 
              @click="spinWheel"
              :disabled="isSpinning"
              class="spin-center-button">
              Spin
            </button>
          </template>
        </VueWheelSpinner>
      </div>
    </div>

    <div class="settings-container">
      <div class="setting-group">
        <label>Mode</label>
        <div class="mode-buttons">
          <button 
            class="mode-btn" 
            :class="{ active: mode === 'binary' }"
            @click="setMode('binary')">
            YES or NO
          </button>
          <button 
            class="mode-btn" 
            :class="{ active: mode === 'ternary' }"
            @click="setMode('ternary')">
            YES NO or MAYBE
          </button>
        </div>
      </div>
      
      <div class="setting-group">
        <label>Number of Input Sets</label>
        <div class="input-sets">
          <button 
            v-for="n in 7" 
            :key="n" 
            class="input-set-btn" 
            :class="{ active: inputSets === n }"
            @click="setInputSets(n)">
            {{ n }}
          </button>
        </div>
      </div>

      <button @click="resetResults" class="reset-btn">Reset Results</button>
    </div>
  </div>
</template>

<script>
import VueWheelSpinner from './VueWheelSpinner.vue'

export default {
  components: {
    VueWheelSpinner
  },
  data() {
    return {
      mode: 'binary', // 'binary' or 'ternary'
      inputSets: 4,
      isSpinning: false,
      results: {
        yes: 0,
        no: 0,
        maybe: 0
      },
      lastResult: null,
      winnerIndex: 0,
      cursorPosition: 'edge',
      cursorAngle: 90
    }
  },
  computed: {
    wheelSlices() {
      if (this.mode === 'binary') {
        // Create alternating yes/no slices based on inputSets
        const slices = [];
        for (let i = 0; i < this.inputSets; i++) {
          slices.push({
            color: i % 2 === 0 ? '#5E35B1' : '#03A9F4', // Green for YES, Yellow for NO
            text: i % 2 === 0 ? 'YES' : 'NO'
          });
        }
        return slices;
      } else {
        // Create yes/no/maybe slices based on inputSets
        const slices = [];
        const totalSlices = this.inputSets * 3; // Multiply by 3 for yes/no/maybe
        
        for (let i = 0; i < totalSlices; i++) {
          const type = i % 3;
          if (type === 0) {
            slices.push({ color: '#5E35B1', text: 'YES' }); // Green
          } else if (type === 1) {
            slices.push({ color: '#03A9F4', text: 'NO' }); // Yellow
          } else {
            slices.push({ color: '#0288d1', text: 'MAYBE' }); // Blue
          }
        }
        return slices;
      }
    }
  },
  methods: {
    spinWheel() {
      if (this.isSpinning) return;
      
      // Randomly select a winner
      const randomIndex = Math.floor(Math.random() * this.wheelSlices.length);
      this.winnerIndex = randomIndex;
      this.$refs.spinner.spinWheel(randomIndex);
    },
    onSpinStart() {
      this.isSpinning = true;
    },
    onSpinEnd(winnerIndex) {
      this.isSpinning = false;
      const result = this.wheelSlices[winnerIndex].text.toLowerCase();
      this.lastResult = result;
      this.results[result]++;
    },
    setMode(mode) {
      this.mode = mode;
    },
    setInputSets(sets) {
      this.inputSets = sets;
    },
    resetResults() {
      this.results = {
        yes: 0,
        no: 0,
        maybe: 0
      };
      this.lastResult = null;
    }
  }
}
</script>

<style scoped>
.yes-no-wheel-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 800px;
  margin: 0 auto;
}

.result-display {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.result-box {
  width: 150px;
  height: 150px;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.result-box.yes {
  background-color: #5E35B1; /* Green */
  color: white;
}

.result-box.no {
  background-color: #03A9F4; /* Yellow */
  color: black;
}

.result-box.maybe {
  background-color: #0288d1; /* Blue */
  color: white;
}

.result-box.active {
  transform: scale(1.05);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
}

.result-count {
  font-size: 64px;
  font-weight: bold;
}

.result-label {
  font-size: 24px;
  font-weight: bold;
}

.wheel-container {
  display: flex;
  justify-content: center;
}

.wheel-wrapper {
  width: 400px;
  height: 400px;
}

.settings-container {
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.setting-group {
  margin-bottom: 20px;
}

.setting-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 10px;
  color: #333;
}

.mode-buttons, .input-sets {
  display: flex;
  gap: 10px;
}

.mode-btn, .input-set-btn {
  padding: 10px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn {
  flex: 1;
}

.mode-btn:hover, .input-set-btn:hover {
  background-color: #f1f1f1;
}

.mode-btn.active, .input-set-btn.active {
  background-color: #333;
  color: white;
  border-color: #333;
}

.reset-btn {
  width: 100%;
  padding: 12px;
  background-color: #3c56e7;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s;
}

.reset-btn:hover {
  background-color: #2ba7c0;
}

.spin-center-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #6f3ce7;
  color: white;
  border: none;
  font-size: 18px;
  cursor: pointer;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}

.spin-center-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .result-display {
    flex-direction: column;
    align-items: center;
  }
  
  .result-box {
    width: 100%;
    max-width: 200px;
  }
}
</style>
