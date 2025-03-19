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
                  <path d="M12 2 C12 2, 2 16, 2 22 C2 28, 22 28, 22 22 C22 16, 12 2, 12 2 Z" fill="#e74c3c" />
                  
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
            <h2>INPUTS</h2>
            <span class="item-count">{{ slices.length }}</span>
            <div class="header-actions">
              <button class="icon-btn" title="View options">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <circle cx="12" cy="12" r="4" fill="#333" />
                </svg>
              </button>
              <button class="icon-btn" title="Refresh">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="#333" />
                </svg>
              </button>
              <button class="icon-btn active" title="List view">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" fill="#f39c12" />
                </svg>
              </button>
              <button class="icon-btn" title="More options">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" fill="#333" />
                </svg>
              </button>
            </div>
          </div>
          
          <!-- Input field -->
          <div class="input-container">
            <input 
              type="text" 
              v-model="newItemText" 
              placeholder="Input text here..." 
              class="form-control"
              @keyup.enter="addNewItem" />
            <button class="add-btn" @click="addNewItem">
              <svg viewBox="0 0 24 24" width="16" height="16">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#333" />
              </svg>
            </button>
            <button class="image-btn">
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
                <button class="icon-btn small" title="Move Up" @click="moveItemUp(index)" :disabled="index === 0">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="#777" />
                  </svg>
                </button>
                <button class="icon-btn small" title="Move Down" @click="moveItemDown(index)" :disabled="index === slices.length - 1">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="#777" />
                  </svg>
                </button>
                <button class="icon-btn small" title="Copy" @click="copyItem(index)">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="#777" />
                  </svg>
                </button>
                <button class="icon-btn small" :class="{ active: slice.included !== false }" title="Include in Wheel" @click="toggleItemInclusion(index)">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="#27ae60" />
                  </svg>
                </button>
                <button class="icon-btn small" title="Remove" @click="removeSlice(index)">
                  <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="#e74c3c" />
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

        <!-- Shining Dots Section -->
        <section class="control-section">
          <h2>Shining Dots</h2>
          <div class="info-box">
            Shining dots is not a part of the vue-wheel-spinner component. It's a
            separate component which built in this demo. You can create
            different external ornaments like this.
          </div>

          <div class="control-group">
            <label>Border Color / Width</label>
            <div class="input-group">
              <div 
                class="color-box" 
                :style="{ backgroundColor: borderColor }"
                @click="selectBorderColor">
              </div>
              <input 
                type="number" 
                v-model.number="borderWidth" 
                class="form-control" 
                min="0" 
                max="50" />
            </div>
          </div>

          <div class="control-group">
            <label>Dot Color / Size / Count / Shine Color</label>
            <div class="input-group multi">
              <div 
                class="color-box" 
                :style="{ backgroundColor: dotColor }"
                @click="selectDotColor">
              </div>
              <input 
                type="number" 
                v-model.number="dotSize" 
                class="form-control" 
                min="1" 
                max="20" />
              <input 
                type="number" 
                v-model.number="dotCount" 
                class="form-control" 
                min="10" 
                max="100" />
              <div 
                class="color-box" 
                :style="{ backgroundColor: shineColor }"
                @click="selectShineColor">
              </div>
            </div>
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
      slices: [
        {color: '#ffffff', text: 'sanja', winCount: 2},
        {color: '#e74c3c', text: 'tanja', winCount: 1},
        {color: '#ffffff', text: 'maja', winCount: 1},
        {color: '#e74c3c', text: 'nina', winCount: 1},
        {color: '#ffffff', text: 'mina', winCount: 0},
        {color: '#e74c3c', text: 'amina', winCount: 1},
        {color: '#ffffff', text: 'azra', winCount: 0}
      ],
      isSpinning: false,
      newItemText: '',
      
      // Cursor settings
      cursorAngle: 90,
      cursorDistance: 0,
      cursorPosition: 'edge',
      
      // Border settings
      borderColor: '#1e3a8a',
      borderWidth: 30,
      
      // Dot settings
      dotColor: '#ffffff',
      dotSize: 8,
      dotCount: 60,
      shineColor: '#ffff00'
    }
  },
  computed: {
    wheelWrapperStyle() {
      const dotSizeRatio = this.dotSize / 10;
      const dotSpacing = 360 / this.dotCount;
      
      return {
        border: `${this.borderWidth}px solid ${this.borderColor}`,
        position: 'relative',
        borderRadius: '50%',
        boxShadow: '0 0 0 5px rgba(255, 255, 255, 0.2), inset 0 0 20px rgba(0, 0, 0, 0.2)',
        overflow: 'hidden',
        '--border-width': `${this.borderWidth}px`,
        '--border-color': this.borderColor,
        '--dot-color': this.dotColor,
        '--dot-size': this.dotSize,
        '--dot-count': this.dotCount,
        '--shine-color': this.shineColor,
        '--dot-size-ratio': dotSizeRatio,
        '--dot-spacing': dotSpacing
      }
    }
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
      
      const newColor = this.slices.length % 2 === 0 ? '#ffffff' : '#e74c3c';
      this.slices.push({
        color: newColor,
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
    selectBorderColor() {
      const colors = ['#1e3a8a', '#2c3e50', '#000000', '#3498db', '#e74c3c']
      const currentIndex = colors.indexOf(this.borderColor)
      this.borderColor = colors[(currentIndex + 1) % colors.length]
    },
    selectDotColor() {
      const colors = ['#ffffff', '#f1c40f', '#e74c3c', '#3498db', '#2ecc71']
      const currentIndex = colors.indexOf(this.dotColor)
      this.dotColor = colors[(currentIndex + 1) % colors.length]
    },
    selectShineColor() {
      const colors = ['#ffff00', '#ffffff', '#ff9900', '#00ffff', '#ff00ff']
      const currentIndex = colors.indexOf(this.shineColor)
      this.shineColor = colors[(currentIndex + 1) % colors.length]
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
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
}

.control-section h2 {
  margin-top: 0;
  font-size: 20px;
  margin-bottom: 15px;
  color: #333;
}

.control-group {
  margin-bottom: 15px;
}

.control-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.input-group {
  display: flex;
  gap: 10px;
  align-items: center;
}

.input-group.multi {
  flex-wrap: wrap;
}

.input-group .form-control {
  flex: 1;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-danger {
  background-color: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background-color: #c0392b;
}

.color-box {
  width: 30px;
  height: 30px;
  border-radius: 4px;
  border: 1px solid #ddd;
  cursor: pointer;
}

.info-box {
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 15px;
  font-size: 14px;
}

.winner-text {
  font-size: 24px;
  margin-bottom: 20px;
  color: #333;
}

.spin-center-button {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #e74c3c;
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

.angle-presets {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  margin-top: 10px;
}

.angle-preset-btn {
  padding: 5px 8px;
  background-color: #f1f1f1;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: all 0.2s;
}

.angle-preset-btn:hover {
  background-color: #e0e0e0;
}

.angle-preset-btn.active {
  background-color: #3498db;
  color: white;
  border-color: #2980b9;
}

/* Custom wheel styling */
.wheel-wrapper :deep(.wheel-wrapper) {
  position: relative;
  overflow: hidden;
}

.wheel-wrapper :deep(.wheel-wrapper)::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: radial-gradient(circle at center, transparent 60%, rgba(0, 0, 0, 0.1) 60.5%);
  z-index: 10;
  pointer-events: none;
}

.wheel-wrapper :deep(.wheel-wrapper)::after {
  content: '';
  position: absolute;
  top: calc(-1 * var(--border-width));
  left: calc(-1 * var(--border-width));
  right: calc(-1 * var(--border-width));
  bottom: calc(-1 * var(--border-width));
  border-radius: 50%;
  background-image: 
    radial-gradient(circle at center, transparent 62%, var(--border-color) 62.5%),
    repeating-conic-gradient(
      from 0deg,
      var(--dot-color) 0deg calc(var(--dot-size-ratio) * 1deg),
      var(--shine-color) calc(var(--dot-size-ratio) * 1deg) calc(var(--dot-size-ratio) * 2deg),
      transparent calc(var(--dot-size-ratio) * 2deg) calc(var(--dot-spacing) * 1deg)
    );
  z-index: -1;
  pointer-events: none;
}

/* Item list styling */
.items-list {
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 15px;
  border: 1px solid #eee;
  border-radius: 6px;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #eee;
  transition: all 0.2s ease;
  position: relative;
}

.item-row:last-child {
  border-bottom: none;
}

.item-row:hover {
  background-color: #f9f9f9;
}

.item-row.excluded {
  opacity: 0.6;
  background-color: #f8f8f8;
  text-decoration: line-through;
}

.item-color-indicator {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 10px;
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
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 10px;
  font-weight: bold;
}

.item-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s;
}

.icon-btn:hover {
  background-color: #f1f1f1;
}

.icon-btn.small {
  padding: 3px;
}

.icon-btn.active {
  background-color: #e8f7f0;
}

.icon-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.add-btn:hover, .image-btn:hover {
  background-color: #e0e0e0;
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h2 {
  margin: 0;
  flex: 1;
}

.item-count {
  background-color: #3498db;
  color: white;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 12px;
  margin-left: 10px;
}

.header-actions {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.spin-btn {
  width: 100%;
  margin-top: 15px;
  font-weight: bold;
  font-size: 16px;
  padding: 12px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }
  
  .wheel-container, .controls {
    width: 100%;
  }
}
</style>
