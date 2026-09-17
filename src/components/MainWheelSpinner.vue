<template>
  <div class="container">
    <div class="main-content">
      <!-- ── Wheel stage ─────────────────────────────────────────────── -->
      <div class="wheel-container">
        <h2 class="winner-text" :class="{ 'empty': !winnerResult }">
          {{ winnerResult ? $t('mainWheel.winner', { text: winnerResult.text }) : '' }}
        </h2>
        <div class="wheel-wrapper">
          <VueWheelSpinner
            ref="spinner"
            :slices="slices"
            :winner-index="defaultWinner"
            :spin-duration="spinDuration"
            :cursor-position="cursorPosition"
            :cursor-angle="cursorAngle"
            :cursor-distance="cursorDistance"
            :muted="!soundEnabled"
            :volume="volume"
            :sounds="{
              spinning: '/sounds/tick.mp3',
              won: '/sounds/win.mp3'
            }"
            @spin-start="onSpinStart"
            @spin-end="onSpinEnd">

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
                @pointerdown.prevent="onHoldStart"
                @pointerup="onHoldRelease"
                @pointercancel="onHoldRelease"
                @pointerleave="onHoldRelease"
                :class="{ 'is-spinning': isSpinning }"
                class="spin-center-button">
                {{ $t('mainWheel.spin') }}
              </button>
            </template>
          </VueWheelSpinner>
        </div>

        <button class="btn btn-primary spin-main-btn" :disabled="isSpinning" @click="spinWheel">
          {{ $t('mainWheel.spinTheWheel') }}
        </button>
        <p class="spin-hints">
          <span class="hint-chip">{{ $t('mainWheel.pressSpace') }}</span>
          <span class="hint-chip">{{ $t('mainWheel.holdHint') }}</span>
        </p>
      </div>

      <!-- ── Controls ────────────────────────────────────────────────── -->
      <div class="controls">
        <section class="control-section">
          <div class="tabs" role="tablist">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              role="tab"
              class="tab-btn"
              :class="{ active: activeTab === tab.id }"
              :aria-selected="activeTab === tab.id ? 'true' : 'false'"
              @click="activeTab = tab.id">
              <span class="tab-icon" aria-hidden="true">{{ tab.icon }}</span>
              <span class="tab-label">{{ $t(tab.label) }}</span>
            </button>
          </div>

          <!-- Visible from every tab, not just List -->
          <p v-if="errorMessage" class="inline-error" role="alert">{{ errorMessage }}</p>

          <!-- LIST -->
          <div v-show="activeTab === 'list'" class="tab-panel">
            <div class="section-header">
              <h2 class="section-title">
                <span class="item-count-badge">{{ slices.length }}</span>
                {{ $t('mainWheel.inputs') }}
              </h2>
              <div class="header-actions">
                <button class="icon-btn action-btn" :title="$t('mainWheel.reset')" @click="resetInputs">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08A5.99 5.99 0 0 1 12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" fill="currentColor" />
                  </svg>
                </button>
                <button class="icon-btn action-btn" :title="$t('mainWheel.shuffle')" @click="shuffleItems">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" fill="currentColor" />
                  </svg>
                </button>
              </div>
            </div>

            <div class="input-container">
              <input
                type="text"
                v-model="newItemText"
                :placeholder="$t('mainWheel.placeholder')"
                class="form-control"
                @keyup.enter="addNewItem" />
              <button class="add-btn" @click="addNewItem" :title="$t('mainWheel.inputs')">
                <svg viewBox="0 0 24 24" width="16" height="16">
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="#333" />
                </svg>
              </button>
            </div>

            <div class="items-list">
              <div
                v-for="(slice, index) in slices"
                :key="index"
                class="item-row"
                :class="{ 'excluded': slice.included === false }">
                <input type="color" v-model="slice.color" class="item-color-input" @input="updateWheel">
                <div class="item-text">{{ slice.text }}</div>
                <div class="win-counter" v-if="slice.winCount > 0">+{{ slice.winCount }}</div>
                <div class="item-actions">
                  <button class="action-btn move-up" :title="$t('mainWheel.moveUp')" @click="moveItemUp(index)" :disabled="index === 0">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor" />
                    </svg>
                  </button>
                  <button class="action-btn move-down" :title="$t('mainWheel.moveDown')" @click="moveItemDown(index)" :disabled="index === slices.length - 1">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M7.41 8.59L12 13.17l4.59-4.58L18 10l-6 6-6-6 1.41-1.41z" fill="currentColor" />
                    </svg>
                  </button>
                  <button class="action-btn copy" :title="$t('mainWheel.copy')" @click="copyItem(index)">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" fill="currentColor" />
                    </svg>
                  </button>
                  <button class="action-btn include" :class="{ active: slice.included !== false }" :title="$t('mainWheel.includeItem')" @click="toggleItemInclusion(index)">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor" />
                    </svg>
                  </button>
                  <button class="action-btn remove" :title="$t('mainWheel.removeSlice')" @click="removeSlice(index)">
                    <svg viewBox="0 0 24 24" width="18" height="18">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- STYLE -->
          <div v-show="activeTab === 'style'" class="tab-panel">
            <div class="control-group">
              <label>{{ $t('mainWheel.palette') }}</label>
              <div class="palette-grid">
                <button
                  v-for="palette in palettes"
                  :key="palette.id"
                  class="palette-btn"
                  :class="{ active: activePalette === palette.id }"
                  @click="applyPalette(palette)">
                  <span class="palette-swatches" aria-hidden="true">
                    <i v-for="(color, i) in palette.colors.slice(0, 5)" :key="i" :style="{ backgroundColor: color }"></i>
                  </span>
                  <span class="palette-name">{{ $t(palette.label) }}</span>
                </button>
              </div>
            </div>

            <details class="advanced-block">
              <summary>{{ $t('mainWheel.advanced') }}</summary>
              <div class="advanced-body">
                <div class="control-group">
                  <label>{{ $t('mainWheel.cursorAngle') }}</label>
                  <div class="input-group">
                    <input type="number" v-model.number="cursorAngle" class="form-control" min="0" max="360" />
                    <button class="btn btn-sm" @click="cursorAngle = Math.max(0, cursorAngle - 10)">-</button>
                    <button class="btn btn-sm" @click="cursorAngle = Math.min(360, cursorAngle + 10)">+</button>
                  </div>
                  <div class="angle-presets">
                    <button
                      v-for="angle in [0, 45, 90, 135, 180, 225, 270, 315, 360]"
                      :key="angle"
                      class="angle-preset-btn"
                      :class="{ active: cursorAngle === angle }"
                      @click="cursorAngle = angle">
                      {{ angle }}°
                    </button>
                  </div>
                </div>
                <div class="control-group">
                  <label>{{ $t('mainWheel.cursorDistance') }}</label>
                  <input type="number" v-model.number="cursorDistance" class="form-control" min="0" />
                </div>
              </div>
            </details>
          </div>

          <!-- SOUND -->
          <div v-show="activeTab === 'sound'" class="tab-panel">
            <label class="switch-row">
              <input type="checkbox" v-model="soundEnabled" />
              <span>{{ $t('mainWheel.soundEffects') }}</span>
            </label>
            <div class="control-group" :class="{ disabled: !soundEnabled }">
              <label>{{ $t('mainWheel.volume') }} — {{ Math.round(volume * 100) }}%</label>
              <input type="range" min="0" max="1" step="0.05" v-model.number="volume" :disabled="!soundEnabled" class="range-input" />
            </div>
          </div>

          <!-- SPIN -->
          <div v-show="activeTab === 'spin'" class="tab-panel">
            <div class="control-group">
              <label>{{ $t('mainWheel.spinSpeed') }}</label>
              <div class="segmented">
                <button
                  v-for="speed in spinSpeeds"
                  :key="speed.value"
                  class="segment-btn"
                  :class="{ active: spinDuration === speed.value }"
                  @click="spinDuration = speed.value">
                  {{ $t(speed.label) }}
                </button>
              </div>
            </div>
            <label class="switch-row">
              <input type="checkbox" v-model="showWinnerPopup" />
              <span>{{ $t('mainWheel.winnerPopup') }}</span>
            </label>
            <button class="btn btn-primary spin-btn" :disabled="isSpinning" @click="spinWheel">
              {{ $t('mainWheel.spinTheWheel') }}
            </button>
          </div>
        </section>

        <!-- ── Results ──────────────────────────────────────────────── -->
        <section class="control-section results-section">
          <div class="section-header">
            <h2 class="section-title">
              <span class="item-count-badge">{{ history.length }}</span>
              {{ $t('mainWheel.results') }}
            </h2>
            <div class="header-actions" v-if="history.length">
              <button class="icon-btn action-btn" :title="$t('mainWheel.clearResults')" @click="clearResults">
                <svg viewBox="0 0 24 24" width="20" height="20">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor" />
                </svg>
              </button>
            </div>
          </div>
          <ol class="history-list">
            <li v-for="(entry, index) in recentHistory" :key="index" class="history-row">
              <span class="history-dot" :style="{ backgroundColor: entry.color }" aria-hidden="true"></span>
              <span class="history-text">{{ entry.text }}</span>
            </li>
          </ol>
        </section>
      </div>
    </div>

    <!-- ── Winner popup ───────────────────────────────────────────── -->
    <Transition name="pop">
      <div
        v-if="showModal && winnerResult"
        class="modal-backdrop"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rw-winner-name"
        @click.self="closeModal">
        <div class="modal-card">
          <div class="confetti" aria-hidden="true">
            <span v-for="n in 18" :key="n" :style="confettiStyle(n)"></span>
          </div>
          <div class="modal-emoji" aria-hidden="true">🎉</div>
          <p id="rw-winner-name" class="modal-winner" :style="{ color: winnerResult.color }">{{ winnerResult.text }}</p>
          <div class="modal-actions">
            <button ref="modalPrimary" class="btn btn-primary modal-btn" @click="spinAgain">{{ $t('mainWheel.spinAgain') }}</button>
            <button class="btn btn-ghost modal-btn" :disabled="slices.length <= 2" @click="removeWinner">
              {{ $t('mainWheel.removeWinner') }}
            </button>
            <button class="btn btn-plain modal-btn" @click="closeModal">{{ $t('mainWheel.close') }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import VueWheelSpinner from './VueWheelSpinner.vue'

const PREFS_KEY = 'randowheel:ui-prefs'

// Slice colour schemes — kept in the site's purple/light family.
const PALETTES = [
  { id: 'vibrant', label: 'mainWheel.paletteVibrant', colors: ['#6c5ce7', '#00b894', '#e17055', '#0984e3', '#fdcb6e', '#d63031', '#00cec9', '#a29bfe'] },
  { id: 'pastel', label: 'mainWheel.palettePastel', colors: ['#b79ced', '#a2d2ff', '#ffc8dd', '#caffbf', '#ffd6a5', '#9bf6ff', '#fdffb6', '#ffc6ff'] },
  { id: 'ocean', label: 'mainWheel.paletteOcean', colors: ['#0a3d62', '#1e6091', '#1e90ff', '#48cae4', '#90e0ef', '#caf0f8', '#0077b6', '#023e8a'] },
  { id: 'sunset', label: 'mainWheel.paletteSunset', colors: ['#ff6b6b', '#ff8e53', '#ffb703', '#fb8500', '#e63946', '#f4978e', '#f9c74f', '#d62828'] },
  { id: 'mono', label: 'mainWheel.paletteMono', colors: ['#1a1a2e', '#2f2f45', '#4a4a68', '#6c6c8a', '#8f8fab', '#b3b3c6', '#d6d6e2', '#f2f2f7'] }
]

export default {
  components: {
    VueWheelSpinner
  },
  props: {
    initialSlices: {
      type: Array,
      default: () => [
        {color: '#4361ee', text: 'James', winCount: 0},
        {color: '#ffc8dd', text: 'Curry', winCount: 0},
        {color: '#7161ef', text: 'Durant', winCount: 0},
        {color: '#00a6fb', text: 'Tatum', winCount: 0},
        {color: '#a2d2ff', text: 'Irving', winCount: 0},
        {color: '#b79ced', text: 'Lillard', winCount: 0},
        {color: '#f7e1d7', text: 'Harden', winCount: 0}
      ]
    }
  },
  data() {
    return {
      winnerResult: null,
      defaultWinner: 0,
      slices: this.initialSlices.map(slice => ({ ...slice })),
      isSpinning: false,
      newItemText: '',
      errorMessage: '',

      // Panel state
      tabs: [
        { id: 'list', icon: '📝', label: 'mainWheel.tabList' },
        { id: 'style', icon: '🎨', label: 'mainWheel.tabStyle' },
        { id: 'sound', icon: '🔊', label: 'mainWheel.tabSound' },
        { id: 'spin', icon: '🎡', label: 'mainWheel.tabSpin' }
      ],
      activeTab: 'list',
      palettes: PALETTES,
      activePalette: null,

      // Sound
      soundEnabled: true,
      volume: 0.5,

      // Spin behaviour
      spinDuration: 7000,
      spinSpeeds: [
        { value: 4000, label: 'mainWheel.speedFast' },
        { value: 7000, label: 'mainWheel.speedNormal' },
        { value: 11000, label: 'mainWheel.speedSlow' }
      ],
      showWinnerPopup: true,
      showModal: false,

      // Results history (most recent first)
      history: [],

      // Cursor settings (advanced)
      cursorAngle: 90,
      cursorDistance: -15,
      cursorPosition: 'edge'
    }
  },
  computed: {
    recentHistory() {
      return this.history.slice(0, 8)
    },
    isRtl() {
      try {
        return getComputedStyle(document.documentElement).direction === 'rtl'
      } catch (e) {
        return false
      }
    }
  },
  mounted() {
    this.loadPrefs()
    window.addEventListener('keydown', this.onKeydown)
  },
  beforeUnmount() {
    window.removeEventListener('keydown', this.onKeydown)
  },
  methods: {
    // ── Preferences (localStorage, best-effort) ────────────────────────
    loadPrefs() {
      try {
        const raw = window.localStorage.getItem(PREFS_KEY)
        if (!raw) return
        const prefs = JSON.parse(raw)
        if (typeof prefs.soundEnabled === 'boolean') this.soundEnabled = prefs.soundEnabled
        if (typeof prefs.volume === 'number') this.volume = prefs.volume
        if (typeof prefs.spinDuration === 'number') this.spinDuration = prefs.spinDuration
        if (typeof prefs.showWinnerPopup === 'boolean') this.showWinnerPopup = prefs.showWinnerPopup
      } catch (e) { /* private mode / disabled storage — use defaults */ }
    },
    savePrefs() {
      try {
        window.localStorage.setItem(PREFS_KEY, JSON.stringify({
          soundEnabled: this.soundEnabled,
          volume: this.volume,
          spinDuration: this.spinDuration,
          showWinnerPopup: this.showWinnerPopup
        }))
      } catch (e) { /* ignore */ }
    },

    // ── Keyboard: Space spins, Escape closes the popup ────────────────
    onKeydown(event) {
      if (event.key === 'Escape' && this.showModal) {
        this.closeModal()
        return
      }
      if (event.code !== 'Space' && event.key !== ' ') return
      const target = event.target
      const tag = target && target.tagName ? target.tagName.toLowerCase() : ''
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || (target && target.isContentEditable)) return
      if (event.metaKey || event.ctrlKey || event.altKey) return
      event.preventDefault()
      if (this.showModal) {
        this.spinAgain()
        return
      }
      this.spinWheel()
    },

    // ── Hold-to-spin: wheel turns while held, decelerates on release ──
    onHoldStart(event) {
      // Capture the pointer so the release (pointerup) is always delivered to
      // this button — even if the layout shifts while holding — instead of
      // being lost to a spurious pointerleave.
      if (event && typeof event.pointerId === 'number' && event.currentTarget && event.currentTarget.setPointerCapture) {
        try {
          event.currentTarget.setPointerCapture(event.pointerId)
        } catch (e) { /* capture not supported / already released — ignore */ }
      }
      this.$refs.spinner.startHoldSpin()
    },
    onHoldRelease() {
      // Pick the winner from the included slices and let the wheel decelerate
      if (!this.isSpinning) return
      const includedSlices = this.includedSlices()
      if (includedSlices.length === 0) return
      const randomIndex = this.pickWinnerIndex(includedSlices)
      this.$refs.spinner.releaseHoldSpin(randomIndex)
    },
    spinWheel() {
      if (this.isSpinning) return

      const includedSlices = this.includedSlices()
      if (includedSlices.length === 0) {
        this.errorMessage = this.$t('mainWheel.pleaseInclude')
        return
      }
      this.errorMessage = ''
      this.showModal = false
      this.$refs.spinner.spinWheel(this.pickWinnerIndex(includedSlices))
    },

    includedSlices() {
      return this.slices.filter(slice => slice.included !== false)
    },

    /**
     * Random index into the FILTERED (included) list. VueWheelSpinner filters
     * with the same rule, so passing an index into the full array misaligns
     * whenever any item is excluded.
     */
    pickWinnerIndex(includedSlices) {
      return Math.floor(Math.random() * includedSlices.length)
    },

    onSpinStart() {
      this.winnerResult = null
      this.showModal = false
      this.isSpinning = true
      this.errorMessage = ''
    },
    onSpinEnd(winnerIndex) {
      this.isSpinning = false
      const includedSlices = this.includedSlices()
      const winner = includedSlices[winnerIndex]
      if (!winner) return
      this.winnerResult = winner
      winner.winCount = (winner.winCount || 0) + 1
      this.history.unshift({ text: winner.text, color: winner.color })
      if (this.history.length > 50) this.history.length = 50
      if (this.showWinnerPopup) this.showModal = true
    },

    // ── Winner popup actions ──────────────────────────────────────────
    closeModal() {
      this.showModal = false
    },
    spinAgain() {
      this.showModal = false
      this.$nextTick(() => this.spinWheel())
    },
    removeWinner() {
      if (!this.winnerResult) return
      const index = this.slices.indexOf(this.winnerResult)
      this.showModal = false
      if (index !== -1) this.removeSlice(index)
      this.winnerResult = null
    },

    // ── Results ───────────────────────────────────────────────────────
    clearResults() {
      this.history = []
      this.slices.forEach(slice => { slice.winCount = 0 })
    },

    // ── Items ─────────────────────────────────────────────────────────
    addNewItem() {
      const text = this.newItemText.trim()
      if (!text) return

      const palette = this.palettes.find(p => p.id === this.activePalette)
      const color = palette
        ? palette.colors[this.slices.length % palette.colors.length]
        : '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')

      this.slices.push({ color, text, winCount: 0 })
      this.newItemText = ''
      this.updateWheel()
    },
    removeSlice(index) {
      if (this.slices.length > 2) {
        this.slices.splice(index, 1)
        this.updateWheel()
      }
    },
    updateWheel() {
      if (this.$refs.spinner && this.$refs.spinner.drawWheel) {
        this.$nextTick(() => {
          this.$refs.spinner.drawWheel()
        })
      }
    },
    moveItemUp(index) {
      if (index > 0) {
        const temp = this.slices[index]
        this.slices[index] = this.slices[index - 1]
        this.slices[index - 1] = temp
        this.updateWheel()
      }
    },
    moveItemDown(index) {
      if (index < this.slices.length - 1) {
        const temp = this.slices[index]
        this.slices[index] = this.slices[index + 1]
        this.slices[index + 1] = temp
        this.updateWheel()
      }
    },
    copyItem(index) {
      const originalItem = this.slices[index]
      const newItem = {
        color: originalItem.color,
        text: `${originalItem.text} ${this.$t('mainWheel.copySuffix')}`,
        winCount: 0,
        included: originalItem.included !== false
      }
      this.slices.splice(index + 1, 0, newItem)
      this.updateWheel()
    },
    toggleItemInclusion(index) {
      this.slices[index].included = this.slices[index].included === false ? true : false
      this.updateWheel()
    },
    resetInputs() {
      this.slices = []
      this.newItemText = ''
      this.errorMessage = ''
      this.winnerResult = null
      this.showModal = false
      this.updateWheel()
    },
    shuffleItems() {
      // Fisher-Yates shuffle
      for (let i = this.slices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[this.slices[i], this.slices[j]] = [this.slices[j], this.slices[i]]
      }
      this.updateWheel()
    },

    // ── Style ─────────────────────────────────────────────────────────
    applyPalette(palette) {
      this.activePalette = palette.id
      const colors = palette.colors
      this.slices.forEach((slice, index) => {
        slice.color = colors[index % colors.length]
      })
      this.updateWheel()
    },

    // ── Winner popup confetti ─────────────────────────────────────────
    confettiStyle(n) {
      const palette = this.palettes[0].colors
      const color = palette[n % palette.length]
      const left = (n * 37) % 100
      const delay = (n % 9) * 0.12
      const duration = 1.8 + ((n % 5) * 0.25)
      const rotate = (n * 47) % 360
      const size = 6 + (n % 4) * 3
      return {
        backgroundColor: color,
        left: `${left}%`,
        width: `${size}px`,
        height: `${size * 1.6}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        transform: `rotate(${rotate}deg)`
      }
    },

    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },

    rgbToHex(r, g, b) {
      return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
    }
  },
  watch: {
    soundEnabled() { this.savePrefs() },
    volume() { this.savePrefs() },
    spinDuration() { this.savePrefs() },
    showWinnerPopup() { this.savePrefs() },
    // Move focus into the popup so keyboard users can act on it right away
    showModal(open) {
      if (!open) return
      this.$nextTick(() => {
        const button = this.$refs.modalPrimary
        if (button) button.focus()
      })
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
  overflow-x: hidden;
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

.winner-text {
  min-height: 2em;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 0 10px 0;
  padding: 0 10px;
  text-align: center;
  color: #27ae60;
  font-size: 1.3em;
}

.winner-text.empty {
  visibility: hidden;
}

.wheel-wrapper {
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 20px auto;
  border: none;
  border-radius: 50%;
  box-shadow: none;
  aspect-ratio: 1 / 1;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}

.spin-main-btn {
  width: 100%;
  max-width: 340px;
  font-weight: bold;
  font-size: 17px;
  padding: 14px 22px;
  border-radius: 10px;
  box-shadow: 0 6px 16px rgba(108, 92, 231, 0.28);
}

.spin-main-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  box-shadow: none;
}

.spin-hints {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin: 12px 0 0;
}

.hint-chip {
  background: #f4f2ff;
  color: #5b4dc7;
  border: 1px solid #e3dfff;
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 0.78rem;
  font-weight: 600;
}

.controls {
  flex: 1;
  min-width: 300px;
}

.control-section {
  margin-bottom: 24px;
  border: 1px solid #e6e6ef;
  border-radius: 14px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(26, 26, 46, 0.05);
  background-color: #fff;
}

/* ── Tabs ── */
.tabs {
  display: flex;
  gap: 6px;
  background: #f5f4fb;
  border-radius: 12px;
  padding: 5px;
  margin-bottom: 18px;
}

.tab-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  background: transparent;
  border-radius: 9px;
  padding: 9px 6px;
  cursor: pointer;
  color: #5b5b74;
  font-size: 0.86rem;
  font-weight: 600;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
  white-space: nowrap;
}

.tab-btn:hover {
  color: #1a1a2e;
}

.tab-btn.active {
  background: #fff;
  color: #6c5ce7;
  box-shadow: 0 1px 4px rgba(26, 26, 46, 0.12);
}

.tab-icon {
  font-size: 0.95rem;
}

.tab-panel {
  animation: panelIn 0.18s ease-out;
}

@keyframes panelIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a2e;
  margin: 0;
}

.item-count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  padding: 2px 8px;
  background: linear-gradient(145deg, #6c5ce7, #5b4dc7);
  color: #fff;
  font-size: 0.78rem;
  font-weight: 700;
  border-radius: 999px;
}

.header-actions {
  display: flex;
  gap: 4px;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #5b5b74;
  padding: 7px;
  border-radius: 8px;
  display: inline-flex;
  transition: background 0.18s ease, color 0.18s ease;
}

.icon-btn:hover {
  background: #f1eeff;
  color: #6c5ce7;
}

/* ── Items ── */
.input-container {
  display: flex;
  margin-bottom: 12px;
  gap: 6px;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.14);
}

.add-btn {
  background-color: #f1eeff;
  border: 1px solid #e0dbff;
  border-radius: 8px;
  padding: 8px 12px;
  cursor: pointer;
}

.add-btn:hover {
  background-color: #e7e2ff;
}

.inline-error {
  margin: 0 0 10px;
  padding: 9px 12px;
  background: #fff5f5;
  border: 1px solid #ffd9d9;
  color: #b23b3b;
  border-radius: 8px;
  font-size: 0.85rem;
}

.items-list {
  max-height: 380px;
  overflow-y: auto;
}

.item-row {
  display: flex;
  align-items: center;
  padding: 10px 6px;
  border-bottom: 1px solid #f2f2f7;
  transition: background 0.2s ease;
  position: relative;
  border-left: 3px solid transparent;
  border-radius: 6px;
}

.item-row:hover {
  background-color: #f7f5ff;
  border-left-color: #6c5ce7;
}

.item-row.excluded {
  opacity: 0.7;
  background-color: #f8f8f8;
  text-decoration: line-through;
  border-left-color: #c9948e;
}

.item-color-input {
  width: 24px;
  height: 24px;
  border: none;
  padding: 0;
  border-radius: 6px;
  margin-right: 12px;
  cursor: pointer;
  background-color: transparent;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.item-color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.item-color-input::-webkit-color-swatch {
  border: none;
  border-radius: 6px;
}
.item-color-input::-moz-color-swatch {
  border: none;
  border-radius: 6px;
}

.item-text {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  overflow-wrap: break-word;
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
  gap: 4px;
  margin-left: 12px;
  opacity: 0.55;
  transition: opacity 0.2s ease;
  flex-shrink: 0;
}

.item-row:hover .item-actions,
.item-row:focus-within .item-actions {
  opacity: 1;
}

.action-btn {
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s;
  position: relative;
  color: #555;
}

.action-btn:hover {
  background-color: #f1f1f1;
  transform: translateY(-2px);
  color: #333;
}

.action-btn.move-up:hover, .action-btn.move-down:hover { color: #3498db; }
.action-btn.copy:hover { color: #f39c12; }
.action-btn.include { color: #27ae60; }
.action-btn.include.active { background-color: #e8f7f0; }
.action-btn.remove:hover { color: #b0736c; }
.action-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* ── Controls ── */
.control-group {
  margin-bottom: 18px;
}

.control-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 0.88rem;
  color: #4a4a68;
}

.control-group.disabled {
  opacity: 0.5;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 6px;
}

.input-group .form-control {
  flex-grow: 1;
}

.input-group .btn-sm {
  padding: 6px 12px;
  font-size: 0.95rem;
  line-height: 1;
  min-width: 34px;
  background-color: #f4f4f8;
  border: 1px solid #e2e2ec;
  border-radius: 8px;
  cursor: pointer;
}

.input-group .btn-sm:hover {
  background-color: #e9e9f2;
}

.btn-primary {
  background-color: #6c5ce7;
  color: white;
  border: none;
  border-radius: 9px;
  padding: 11px 18px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.18s ease;
}

.btn-primary:hover:not(:disabled) {
  background-color: #5b4dc7;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.spin-btn {
  width: 100%;
  margin-top: 6px;
  font-weight: bold;
  font-size: 16px;
  padding: 12px;
}

.range-input {
  width: 100%;
  accent-color: #6c5ce7;
}

.switch-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 11px 12px;
  border: 1px solid #ecebf5;
  border-radius: 10px;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  color: #3d3d55;
}

.switch-row input {
  width: 18px;
  height: 18px;
  accent-color: #6c5ce7;
  cursor: pointer;
}

.segmented {
  display: flex;
  gap: 6px;
  background: #f5f4fb;
  border-radius: 10px;
  padding: 4px;
}

.segment-btn {
  flex: 1;
  border: none;
  background: transparent;
  border-radius: 7px;
  padding: 9px 8px;
  font-weight: 600;
  font-size: 0.85rem;
  color: #5b5b74;
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease;
}

.segment-btn.active {
  background: #fff;
  color: #6c5ce7;
  box-shadow: 0 1px 4px rgba(26, 26, 46, 0.12);
}

/* ── Palettes ── */
.palette-grid {
  display: grid;
  gap: 8px;
}

.palette-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  border: 1px solid #e8e7f2;
  border-radius: 10px;
  padding: 9px 12px;
  cursor: pointer;
  transition: border-color 0.18s ease, box-shadow 0.18s ease;
}

.palette-btn:hover {
  border-color: #cfc9f5;
}

.palette-btn.active {
  border-color: #6c5ce7;
  box-shadow: 0 0 0 3px rgba(108, 92, 231, 0.13);
}

.palette-swatches {
  display: flex;
}

.palette-swatches i {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: block;
  margin-left: -5px;
  box-shadow: 0 0 0 2px #fff;
}

.palette-swatches i:first-child {
  margin-left: 0;
}

.palette-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: #3d3d55;
}

/* ── Advanced ── */
.advanced-block {
  border: 1px solid #ecebf5;
  border-radius: 10px;
  padding: 10px 14px;
  background: #fbfaff;
}

.advanced-block summary {
  cursor: pointer;
  font-weight: 600;
  font-size: 0.88rem;
  color: #5b4dc7;
}

.advanced-body {
  padding-top: 14px;
}

.angle-presets {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.angle-preset-btn {
  background-color: #fff;
  border: 1px solid #e4e3ef;
  border-radius: 7px;
  padding: 6px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #495057;
}

.angle-preset-btn:hover {
  background-color: #f4f2ff;
}

.angle-preset-btn.active {
  background-color: #6c5ce7;
  color: white;
  border-color: #6c5ce7;
  font-weight: 600;
}

/* ── Results ── */
.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 260px;
  overflow-y: auto;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 4px;
  border-bottom: 1px solid #f4f4f8;
  font-size: 0.92rem;
  color: #3d3d55;
}

.history-row:last-child {
  border-bottom: none;
}

.history-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px #eceaf7;
}

.history-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Winner popup ── */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(20, 18, 40, 0.55);
  backdrop-filter: blur(3px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 2000;
}

.modal-card {
  position: relative;
  background: #fff;
  border-radius: 20px;
  padding: 34px 28px 26px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  overflow: hidden;
  box-shadow: 0 24px 60px rgba(20, 18, 40, 0.3);
}

.modal-emoji {
  font-size: 2.2rem;
  line-height: 1;
  margin-bottom: 6px;
}

.modal-winner {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 22px;
  word-break: break-word;
  line-height: 1.2;
}

.modal-actions {
  display: flex;
  flex-direction: column;
  gap: 9px;
}

.modal-btn {
  width: 100%;
  padding: 12px;
  font-size: 0.95rem;
}

.btn-ghost {
  background: #f4f2ff;
  border: 1px solid #e0dbff;
  color: #5b4dc7;
  border-radius: 9px;
  cursor: pointer;
  font-weight: 600;
}

.btn-ghost:hover:not(:disabled) {
  background: #eae5ff;
}

.btn-ghost:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-plain {
  background: transparent;
  border: none;
  color: #6b6b85;
  cursor: pointer;
  font-weight: 600;
  border-radius: 9px;
}

.btn-plain:hover {
  color: #1a1a2e;
}

.confetti {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.confetti span {
  position: absolute;
  top: -12%;
  border-radius: 2px;
  opacity: 0.9;
  animation-name: confettiFall;
  animation-timing-function: ease-in;
  animation-iteration-count: 1;
  animation-fill-mode: forwards;
}

@keyframes confettiFall {
  0%   { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(420px) rotate(320deg); opacity: 0; }
}

.pop-enter-active, .pop-leave-active {
  transition: opacity 0.2s ease;
}

.pop-enter-active .modal-card,
.pop-leave-active .modal-card {
  transition: transform 0.24s cubic-bezier(0.18, 0.89, 0.32, 1.28), opacity 0.2s ease;
}

.pop-enter-from, .pop-leave-to {
  opacity: 0;
}

.pop-enter-from .modal-card {
  transform: scale(0.9) translateY(10px);
  opacity: 0;
}

.pop-leave-to .modal-card {
  transform: scale(0.96);
  opacity: 0;
}

@media (prefers-reduced-motion: reduce) {
  .confetti span { animation: none; opacity: 0; }
  .tab-panel { animation: none; }
}

.spin-center-button {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(145deg, #6c5ce7, #5b4dc7);
  border: none;
  color: white;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(108, 92, 231, 0.4);
  transition: all 0.3s ease;
  z-index: 12;
}

.spin-center-button:hover:not(:disabled) {
  transform: translate(-50%, -50%) scale(1.1);
  box-shadow: 0 6px 14px rgba(108, 92, 231, 0.5);
}

.spin-center-button:active:not(:disabled) {
  transform: translate(-50%, -50%) scale(0.95);
}

/* While spinning (hold or deceleration) the button stays enabled so mouseup /
   touchend can fire; dim it to signal the state instead. */
.spin-center-button.is-spinning {
  background: linear-gradient(145deg, #8e8e8e, #6c6c6c);
  cursor: default;
  opacity: 0.85;
}

@media (max-width: 768px) {
  .container {
    padding: 10px;
  }
  .main-content {
    flex-direction: column;
    gap: 15px;
  }
  .wheel-container,
  .controls {
    flex-basis: 100%;
    min-width: unset;
  }
  .wheel-wrapper {
    max-width: 92vw;
    box-sizing: border-box;
  }
  .controls {
    overflow: hidden;
  }
  .control-section {
    padding: 13px;
  }
  .tab-label {
    font-size: 0.78rem;
  }
  .input-container {
    flex-wrap: wrap;
  }
  .item-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 3px;
    margin-left: 8px;
  }
  .item-text {
    white-space: normal;
    overflow: visible;
    text-overflow: clip;
  }
  .modal-winner {
    font-size: 1.6rem;
  }
}
</style>
