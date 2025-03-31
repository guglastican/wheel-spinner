<template>
  <div class="container">
    <div class="main-content">
      <div class="wheel-container">
        <h2 v-if="winnerResult" class="winner-text">
          Winner: {{ winnerResult.text }} 🎉
        </h2>
        <div class="wheel-wrapper" :style="wheelWrapperStyle">
          <VueWheelSpinner 
            ref="spinner"
            :slices="slices"
            :winner-index="defaultWinner"
            :cursor-position="cursorPosition"
            :cursor-angle="cursorAngle"
            :cursor-distance="cursorDistance"
            @spin-start="onSpinStart"
            @spin-end="onSpinEnd">
            
            <template #cursor>
              <div style="width: 30px; height: 40px;">
                <svg viewBox="0 0 24 32" style="width: 100%; height: 100%; filter: drop-shadow(0px 2px 3px rgba(0, 0, 0, 0.4));">
                  <!-- Teardrop/droplet shape -->
                  <path d="M12 2 C12 2, 2 16, 2 22 C2 28, 22 28, 22 22 C22 16, 12 2, 12 2 Z" fill="#d1cae0" />
                  
                  <!-- Highlight/shine effect -->
                  <path d="M12 4 C12 4, 4 16, 4 21 C4 24, 10 26, 16 24 C10 26, 6 22, 6 19 C6 14, 12 4, 12 4 Z" fill="#f8c9c5" opacity="0.6" />
                  
                  <!-- Inner circle/hole -->
                  <circle cx="12" cy="20" r="4" fill="white" />
                </svg>
              </div>
            </template>
            
            <template #default>
              <button 
                @click="handleSpinButtonClick"
                :disabled="isSpinning"
                class="spin-center-button">
                Spin
              </button>
            </template>
          </VueWheelSpinner>
        </div>
      </div>

      <div class="controls">
        <!-- Inputs Section -->
        <section class="control-section">
          <div class="section-header">
            <div class="header-content">
              <h2 class="section-title">
                <span class="title-icon">🎯</span>
                Inputs
                <span class="item-count-badge">{{ slices.length }}</span>
              </h2>
              <div class="header-actions">
                <button class="icon-btn action-btn" title="Reset" @click="resetInputs">
                  <div class="btn-content">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
                    </svg>
                    <span class="btn-label">Reset</span>
                  </div>
                </button>
                <button class="icon-btn action-btn shuffle-btn" title="Shuffle" @click="shuffleItems">
                  <div class="btn-content">
                    <svg viewBox="0 0 24 24" width="24" height="24">
                      <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
                    </svg>
                    <span class="btn-label">Shuffle</span>
                  </div>
                </button>
              </div>
            </div>
            <div class="header-divider"></div>
          </div>
          
          <!-- Input field -->
          <div class="input-container">
            <input 
              type="text" 
              v-model="newItemText" 
              placeholder="Input text here..." 
              class="form-control"
              @keyup.enter="addNewItem" />
            <button class="add-btn" @click="addNewItem" title="Add item">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#333" />
              </svg>
            </button>
            <button class="image-btn" title="Add image">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" fill="#333" />
              </svg>
            </button>
          </div>
          
          <!-- Items list -->
          <div class="items-list">
            <div 
              v-for="(slice, index) in slices" 
              :key="index" 
              class="item-row"
              :class="{ 'excluded': slice.included === false }">
              <div class="item-color-indicator" :style="{ backgroundColor: slice.color }"></div>
              <div class="item-text">{{ slice.text }}</div>
              <div class="win-counter" v-if="slice.winCount > 0">
                +{{ slice.winCount }}
              </div>
              <div class="item-actions">
                <button class="action-btn move-up" title="Move Up" @click="moveItemUp(index)" :disabled="index === 0">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor" />
                  </svg>
                </button>
                <button class="action-btn move-down" title="Move Down" @click="moveItemDown(index)" :disabled="index === slices.length - 1">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor" />
                  </svg>
                </button>
                <button class="action-btn copy" title="Copy" @click="copyItem(index)">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor" />
                  </svg>
                </button>
                <button class="action-btn include" :class="{ active: slice.included !== false }" title="Include in Wheel" @click="toggleItemInclusion(index)">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                  </svg>
                </button>
                <button class="action-btn remove" title="Remove" @click="removeSlice(index)">
                  <svg viewBox="0 0 24 24" width="18" height="18">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          
          <button @click="spinWheel" class="btn btn-primary spin-btn" :disabled="isSpinning">
            Spin the Wheel
          </button>
        </section>

        <!-- Cursor Section -->
        <section class="control-section">
          <h2>Cursor</h2>
          <div class="control-group">
            <label>Cursor Angle</label>
            <div class="input-group">
              <input 
                type="number" 
                v-model.number="cursorAngle" 
                class="form-control" 
                min="0" 
                max="360" />
              <button 
                @click="cursorAngle = Math.max(0, cursorAngle - 10)" 
                class="btn btn-sm">
                -
              </button>
              <button 
                @click="cursorAngle = Math.min(360, cursorAngle + 10)" 
                class="btn btn-sm">
                +
              </button>
            </div>
            <div class="angle-presets">
              <button 
                v-for="angle in [0, 45, 90, 135, 180, 225, 270, 315, 360]" 
                :key="angle"
                @click="cursorAngle = angle"
                class="angle-preset-btn"
                :class="{ active: cursorAngle === angle }">
                {{ angle }}°
              </button>
            </div>
          </div>

          <div class="control-group">
            <label>Cursor Distance</label>
            <input 
              type="number" 
              v-model.number="cursorDistance" 
              class="form-control" 
              min="0" />
          </div>

          <div class="control-group">
            <label>Cursor Position</label>
            <select v-model="cursorPosition" class="form-control">
              <option value="edge">Edge</option>
              <option value="center">Center</option>
            </select>
          </div>
        </section>

      </div>
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
      winnerResult: null,
      defaultWinner: 0,
      slices: [
        {color: 'rgb(108, 92, 231)', text: 'James', winCount: 0},
        {color: 'rgb(122, 108, 237)', text: 'Curry', winCount: 0},
        {color: 'rgb(136, 124, 243)', text: 'Durant', winCount: 0},
        {color: 'rgb(150, 140, 249)', text: 'Tatum', winCount: 0},
        {color: 'rgb(164, 156, 255)', text: 'Irving', winCount: 0},
        {color: 'rgb(178, 165, 255)', text: 'Lillard', winCount: 0},
        {color: 'rgb(150, 140, 249)', text: 'Harden', winCount: 0}
      ],
      isSpinning: false,
      newItemText: '',
      
      // Cursor settings
      cursorAngle: 90,
      cursorDistance: 0,
      cursorPosition: 'edge',
      
    }
  },
  computed: {
  },
  methods: {
    handleSpinButtonClick() {
      this.spinWheel();
    },
    spinWheel() {
      if (this.isSpinning) return;
      
      // Filter out slices that are not included
      const includedSlices = this.slices.filter(slice => slice.included !== false);
      
      // Check if there are any included slices
      if (includedSlices.length === 0) {
        alert("Please include at least one item in the wheel");
        return;
      }
      
      // Randomly select a winner from included slices
      const randomIndex = Math.floor(Math.random() * includedSlices.length);
      
      // Find the corresponding index in the original slices array
      const originalIndex = this.slices.findIndex(slice => 
        slice === includedSlices[randomIndex]
      );
      
      this.$refs.spinner.spinWheel(randomIndex);
    },
    onSpinStart() {
      this.winnerResult = null;
      this.isSpinning = true;
    },
    onSpinEnd(winnerIndex) {
      this.isSpinning = false;
      this.winnerResult = this.slices[winnerIndex];
      
      // Increment the win counter for the winning item
      this.slices[winnerIndex].winCount = (this.slices[winnerIndex].winCount || 0) + 1;
    },
    addNewItem() {
      if (!this.newItemText.trim()) return;
      
      // Generate a color based on position in the array
      const baseColor1 = [108, 92, 231]; // #6c5ce7
      const baseColor2 = [178, 165, 255]; // #b2a5ff
      const steps = Math.max(1, this.slices.length);
      
      // Calculate interpolated color
      const ratio = (this.slices.length % 10) / 10;
      const newColor = [
        Math.round(baseColor1[0] + (baseColor2[0] - baseColor1[0]) * ratio),
        Math.round(baseColor1[1] + (baseColor2[1] - baseColor1[1]) * ratio),
        Math.round(baseColor1[2] + (baseColor2[2] - baseColor1[2]) * ratio)
      ];
      
      this.slices.push({
        color: `rgb(${newColor.join(',')})`,
        text: this.newItemText.trim(),
        winCount: 0
      });
      
      this.newItemText = '';
      this.updateWheel();
    },
    removeSlice(index) {
      if (this.slices.length > 2) {
        this.slices.splice(index, 1);
        this.updateWheel();
      }
    },
    updateWheel() {
      // Force wheel redraw if needed
      if (this.$refs.spinner && this.$refs.spinner.drawWheel) {
        this.$nextTick(() => {
          this.$refs.spinner.drawWheel()
        })
      }
    },
    openColorPicker(index) {
      // In a real app, you would open a color picker here
      // For this demo, we'll just cycle through some predefined colors
      const colors = ['#e74c3c', '#ffffff', '#3498db', '#2ecc71', '#f1c40f', '#9b59b6']
      const currentIndex = colors.indexOf(this.slices[index].color)
      const nextIndex = (currentIndex + 1) % colors.length
      this.slices[index].color = colors[nextIndex]
      this.updateWheel()
    },
    moveItemUp(index) {
      if (index > 0) {
        // Swap the current item with the one above it
        const temp = this.slices[index];
        this.slices[index] = this.slices[index - 1];
        this.slices[index - 1] = temp;
        this.updateWheel();
      }
    },
    moveItemDown(index) {
      if (index < this.slices.length - 1) {
        // Swap the current item with the one below it
        const temp = this.slices[index];
        this.slices[index] = this.slices[index + 1];
        this.slices[index + 1] = temp;
        this.updateWheel();
      }
    },
    copyItem(index) {
      // Create a copy of the item
      const originalItem = this.slices[index];
      const newItem = {
        color: originalItem.color,
        text: `${originalItem.text} (copy)`,
        winCount: 0,
        included: originalItem.included !== false
      };
      
      // Insert the copy after the original
      this.slices.splice(index + 1, 0, newItem);
      this.updateWheel();
    },
    toggleItemInclusion(index) {
      // Toggle the 'included' property
      this.slices[index].included = this.slices[index].included === false ? true : false;
      this.updateWheel();
    },
    
    resetInputs() {
      // Reset all inputs and clear the slices array
      this.slices = [];
      this.newItemText = '';
      this.updateWheel();
    },
    
    shuffleItems() {
      // Fisher-Yates shuffle algorithm
      for (let i = this.slices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.slices[i], this.slices[j]] = [this.slices[j], this.slices[i]];
      }
      this.updateWheel();
    },


    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    },

    rgbToHex(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  }
}
</script>

<style scoped>
.container {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
}

.wheel-container {
  flex: 1;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.controls {
  flex: 1;
  min-width: 300px;
}

.control-section {
  margin-bottom: 30px;
  border: 1px solid #e0e0e0; /* Lighter border */
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06); /* Slightly softer shadow */
  background-color: #fff;
}

/* Style section headings */
.control-section h2 {
  font-size: 1.1em;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px; /* Increased bottom margin */
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.btn-primary {
  background-color: #6a29e3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  cursor: pointer;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 12px 10px;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
}

.item-row:hover {
  background-color: #f5f8ff;
  border-left-color: #3498db;
}

.item-row.excluded {
  opacity: 0.7;
  background-color: #f8f8f8;
  text-decoration: line-through;
  border-left-color: #c9948e;
}

.item-color-indicator {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  margin-right: 12px;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.item-text {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.win-counter {
  background-color: #27ae60;
  color: white;
  border-radius: 12px;
  padding: 3px 10px;
  font-size: 12px;
  margin-left: 10px;
  font-weight: bold;
}

.item-actions {
  display: flex;
  gap: 8px;
  margin-left: 15px;
  opacity: 0.7;
  transition: opacity 0.2s ease;
}

.item-row:hover .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s;
  position: relative;
  color: #555;
}

.action-btn:hover {
  background-color: #f1f1f1;
  transform: translateY(-2px);
  color: #333;
}

.action-btn.move-up:hover, .action-btn.move-down:hover {
  color: #3498db;
}

.action-btn.copy:hover {
  color: #f39c12;
}

.action-btn.include {
  color: #27ae60;
}

.action-btn.include.active {
  background-color: #e8f7f0;
}

.action-btn.remove:hover {
  color: #b0736c;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.input-container {
  display: flex;
  margin-bottom: 15px;
  gap: 5px;
}

.add-btn, .image-btn {
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  cursor: pointer;
}

        .spin-btn {
  width: 100%;
  margin-top: 15px;
  font-weight: bold;
  font-size: 16px;
  padding: 12px;
}
.item-count {
    display: inline-block;
    padding: 8px 16px;
    background: linear-gradient(145deg, #6c5ce7, #5b4dc7);
    color: white;
    font-size: 18px;
    font-weight: bold;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
    text-align: center;
    min-width: 50px;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.spin-center-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, #3498db, #2980b9);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 16px;
  cursor: pointer;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
}

.spin-center-button:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.3);
}

.spin-center-button:active:not(:disabled) {
  transform: translate(-50%, -50%) scale(0.95);
}

.spin-center-button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  opacity: 0.7;
}

/* Cursor Section Specific Styles */
.control-group {
  margin-bottom: 20px; /* Increased spacing between groups */
}

.control-group label {
  display: block;
  font-weight: 600; /* Bolder labels */
  margin-bottom: 8px; /* Space below label */
  font-size: 0.9em;
  color: #555;
}

.input-group {
  display: flex;
  align-items: center; /* Align items vertically */
  gap: 5px;
}

.input-group .form-control {
  flex-grow: 1; /* Allow input to take available space */
}

.input-group .btn-sm {
  padding: 5px 10px; /* Adjust padding for smaller buttons */
  font-size: 1em;
  line-height: 1;
  min-width: 30px; /* Ensure minimum width */
  background-color: #f0f0f0;
  border: 1px solid #ddd;
}
.input-group .btn-sm:hover {
    background-color: #e0e0e0;
}

.angle-presets {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.angle-preset-btn {
  background-color: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 0.85em;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
}

.angle-preset-btn:hover {
  background-color: #e9ecef;
  border-color: #ced4da;
}

.angle-preset-btn.active {
  background-color: #6c5ce7; /* Use a primary color */
  color: white;
  border-color: #6c5ce7;
  font-weight: 600;
}

/* Ensure select dropdown also has consistent styling */
.control-group select.form-control {
  appearance: none; /* Custom arrow styling might be needed */
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23343a40' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M2 5l6 6 6-6'/%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.75rem center;
  background-size: 16px 12px;
  padding-right: 2.5rem; /* Space for arrow */
}


@media (max-width: 768px) {
  .main-content {
    flex-direction: column; /* Ensure stacking */
  }
  .wheel-container,
  .controls {
    flex-basis: 100%; /* Make each take full width */
    min-width: unset; /* Remove min-width constraint */
  }
}
</style>
