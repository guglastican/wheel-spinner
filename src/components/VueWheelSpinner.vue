<template>
  <div class="wheel-wrapper" ref="playgroundContainer">
    <div ref="cursor" class="cursor">
      <slot name="cursor"></slot>
    </div>
    <canvas ref="playgroundCanvas"></canvas>
    <div class="centered">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import {onBeforeMount, onBeforeUnmount, onMounted, ref, watch} from 'vue';

const playgroundContainer = ref(null)
const playgroundCanvas = ref(null);
const isSpinning = ref(false);
const isHoldSpinning = ref(false);
const cursor = ref(null);
const currentAngle = ref(0);
const spinningAudio = ref(null);
const wonAudio = ref(null);

const emits = defineEmits([
  'spin-start',
  'spin-end'
]);

const props = defineProps({
  slices: {
    type: Array,
    required: true
  },
  winnerIndex: {
    type: Number,
    default: 0
  },
  extraSpins: {
    type: Number,
    default: 10
  },
  spinDuration: {
    type: Number,
    default: 6500
  },
  holdSpeed: {
    type: Number,
    default: 420
  },
  holdDecelSpins: {
    type: Number,
    default: 4
  },
  holdMaxDuration: {
    type: Number,
    default: 10000
  },
  cursorAngle: {
    type: Number,
    default: 270
  },
  cursorPosition: {
    type: String,
    default: 'center'
  },
  cursorDistance: {
    type: Number,
    default: 50
  },
  sounds: {
    type: Object,
    default: () => {
      return {
        spinning: () => null,
        won: () => null
      }
    }
  },
  // Sound can be toggled and re-levelled at runtime from the Sound tab.
  muted: {
    type: Boolean,
    default: false
  },
  volume: {
    type: Number,
    default: 0.5
  },
});

function degreesToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function getSlices() {
  // Filter out slices that have been marked as not included
  return props.slices.filter(slice => slice.included !== false);
}

function getContrastingColor(bgColor) {
  let color = bgColor;
  if (bgColor.charAt(0) === '#') {
    color = bgColor.substring(1, 7);
  }

  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);

  const brightness = (r * 299 + g * 587 + b * 114) / 1000;

  return brightness > 125 ? 'black' : 'white';
}

function getAnglePerSlice() {
  return 360 / getSlices().length;
}

function getCursorAngle() {
  return props.cursorAngle;
}

function getRandomBetween(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getNormalizedAngle(angle) {
  // Always return a non-negative angle in [0, 360) so downstream modulo math
  // (slice-under-cursor, target angles) never sees negative values
  return ((angle % 360) + 360) % 360;
}

function getSliceAngles(sliceIndex, currentCanvasAngle) {

  const slices = getSlices();
  const anglePerSlice = 360 / slices.length;
  const startAngle = getNormalizedAngle(currentCanvasAngle + (anglePerSlice * sliceIndex));
  // endAngle must be startAngle + slice width. The previous code added
  // currentCanvasAngle AGAIN on top of startAngle (which already contains it),
  // shifting the winner's landing zone by the wheel's current rotation — so
  // every spin after the first landed on the wrong slice.
  const endAngle = getNormalizedAngle(startAngle + anglePerSlice);

  return {
    startAngle,
    endAngle
  }

}

/**
 * Spin profile: a smooth wind-up, then a long friction coast to a dead stop
 * exactly on the target.
 *
 * Launch (x < L) — the velocity ramps as x², so the acceleration starts at
 * zero: the wheel eases into motion instead of being kicked. Position is the
 * integral, θ = vmax·x³/(3L²), which makes the launch velocity reach vmax
 * exactly where the coast begins (C1 continuous, no jerk in speed).
 *
 * Coast (x >= L) — velocity follows vmax·(1−u)^p with u = (x−L)/(1−L), which
 * decelerates progressively and reaches exactly zero at the end. A p of ~1.35
 * keeps the wheel visibly moving (roughly a sixth of a turn in the final
 * second) while the last full revolution still takes about a third of the
 * whole spin — the slow, drawn-out finish a wheel should have.
 *
 * vmax is fixed by requiring θ(1) = 1:
 *   θ(1) = vmax·L/3 + vmax·(1−L)/(p+1)  →  vmax = 1 / (L/3 + (1−L)/(p+1))
 *
 * History: this replaced a symmetric ease-in-out sine (the wheel was still
 * accelerating halfway through every spin), and then a uniform-deceleration
 * model, whose finish arrived too flat.
 */
const SPIN_LAUNCH_SHARE = 0.12;
const SPIN_TAIL_POWER = 1.25;

function getSpinEase() {
  const L = SPIN_LAUNCH_SHARE;
  const p = SPIN_TAIL_POWER;
  const vmax = 1 / (L / 3 + (1 - L) / (p + 1));
  const thetaLaunch = (vmax * L) / 3;

  return function spinEase(x) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    if (x < L) return (vmax * x * x * x) / (3 * L * L);
    const u = (x - L) / (1 - L);
    return thetaLaunch + ((vmax * (1 - L)) / (p + 1)) * (1 - Math.pow(1 - u, p + 1));
  };
}

function drawSlice(context, centerX, centerY, radius, startAngle, endAngle, fillColor) {
  // Draw pie slice
  context.beginPath();
  context.moveTo(centerX, centerY);
  context.arc(centerX, centerY, radius, degreesToRadians(startAngle), degreesToRadians(endAngle));
  context.strokeStyle = fillColor;
  context.stroke();
  context.fillStyle = fillColor;
  context.fill();
  context.closePath();
  context.save();
}

function drawLabel(context, centerX, centerY, radius, startAngle, endAngle, fillColor, sliceLabel) {
  // Draw label
  const textRotateAngle = (endAngle - startAngle) / 2 + startAngle;
  context.translate(centerX, centerY);
  context.rotate(degreesToRadians(textRotateAngle));
  context.textAlign = 'right';
  context.textBaseline = 'middle';
  context.fillStyle = getContrastingColor(fillColor);
  
  // Responsive font size based on container width
  const container = getContainer();
  const baseSize = Math.max(16, Math.min(24, container.clientWidth * 0.06)); // Min 16px, max 24px, scales with container
  context.font = `bold ${baseSize}px Arial`;
  
  // Adjust text position based on container size
  const textOffset = Math.max(10, radius * 0.15); // Minimum 10px offset, increased from 5px
  context.fillText(sliceLabel, radius - textOffset, 0);
  context.restore();
}

function getContainer() {
  return playgroundContainer.value;
}

function getCanvas() {
  return playgroundCanvas.value;
}

function drawWheel() {

  const container = getContainer();
  const canvas = getCanvas();
  const slices = getSlices();

  // Access canvas and context.
  const context = canvas.getContext('2d');

  const containerWidth = container.clientWidth;
  const containerHeight = container.clientWidth;

  // Draw at device resolution so the wheel and its labels stay crisp on HiDPI
  // screens instead of being upscaled from a CSS-pixel-sized bitmap.
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(containerWidth * dpr);
  canvas.height = Math.round(containerHeight * dpr);

  // Setting canvas.width resets the context, so apply the scale afterwards.
  // All drawing below stays in CSS pixels.
  context.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Layout size in CSS pixels (the backing store above is scaled by dpr)
  const width = containerWidth;
  const height = containerHeight;

  // Calculate centroids
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = width / 2;

  // Calculate angle per slice
  const anglePerSlice = 360 / slices.length;

  // Draw slices
  slices.forEach(function (slice, sliceIndex) {

    const startAngle = anglePerSlice * sliceIndex;
    const endAngle = startAngle + anglePerSlice;

    // Draw slice
    drawSlice(context, centerX, centerY, radius, startAngle, endAngle, slice.color);

    // Draw slice label
    drawLabel(context, centerX, centerY, radius, startAngle, endAngle, slice.color, slice.text);

  });

  // Position cursor
  positionCursor();

}

function spinWheel(winnerIndex) {

  // If already spinning do nothing
  if (isSpinning.value) {
    return false;
  }

  // Set spinning true
  isSpinning.value = true;

  // This runs inside the tap/click that started the spin, which is the only
  // moment mobile browsers allow audio to be unlocked.
  unlockAudio();

  // Emit spin start event
  emits('spin-start');

  // Get start angle
  const startAngle = currentAngle.value;

  // Get winner start and end angle with current status
  const {
    endAngle: winnerEndAngle
  } = getSliceAngles(winnerIndex, startAngle);

  // Calculate destination angle. The random offset must be > 0 so the cursor
  // lands strictly inside the winner slice (offset 0 puts it exactly on the
  // slice edge, which reads as the neighboring slice).
  const targetAngle = startAngle + (props.extraSpins * 360) + (getCursorAngle() - winnerEndAngle) + getRandomBetween(1, getAnglePerSlice());

  // Run the decelerating landing animation
  animateToTarget(startAngle, targetAngle, props.spinDuration, winnerIndex);

}

/**
 * Decelerating landing animation from a given start angle to a target angle,
 * easing out over `duration` ms and ending on the winner slice.
 * Used both by classic spinWheel and by hold-to-spin release.
 */
function animateToTarget(startAngle, targetAngle, duration, winnerIndex, easeFn) {

  const totalRotation = targetAngle - startAngle;
  const ease = easeFn || getSpinEase();

  // Get start time to finish spinning
  const startTime = performance.now();
  let lastSliceIndex = -1;

  // Slice count is fixed for the duration of a spin: resolving it once removes
  // a per-frame array filter + allocation from the animation loop, which matters
  // on phones.
  const sliceCount = getSlices().length;
  const anglePerSlice = sliceCount > 0 ? 360 / sliceCount : 360;
  const cursorAngle = getCursorAngle();

  // Create animation
  const animate = (currentTime) => {

    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    let rotationAngle = startAngle + (totalRotation * ease(progress));
    getCanvas().style.transform = `rotate3d(0, 0, 1, ${rotationAngle}deg)`;

    // Calculate current slice under cursor for ticking sound
    const normalizedRotation = rotationAngle % 360;
    // Calculate which slice index is currently at the cursor position
    const currentSliceIndex = Math.floor(getNormalizedAngle(cursorAngle - normalizedRotation) / anglePerSlice);

    if (currentSliceIndex !== lastSliceIndex) {
      if (progress < 1) {
        playTick();
      }
      lastSliceIndex = currentSliceIndex;
    }

    if (progress < 1) {

      requestAnimationFrame(animate);

    } else {

      rotationAngle = getNormalizedAngle(rotationAngle);
      getCanvas().style.transform = `rotate3d(0, 0, 1, ${rotationAngle}deg)`;
      currentAngle.value = rotationAngle;

      isSpinning.value = false;
      isHoldSpinning.value = false;

      playWon();

      emits('spin-end', winnerIndex);

      applyPendingRedraw();

    }

  };

  // Run animation
  requestAnimationFrame(animate);

}

// ─── Hold-to-spin: wheel turns continuously while the button is held ────────
let holdRafId = null;
let holdTimer = null;
let holdLastTimestamp = null;
let holdLastSliceIndex = -1;
let holdStartTimestamp = null;
let holdCurrentSpeed = 0;
let resizeTimer = null;
let pendingRedraw = false;
let audioUnlockHandler = null;
const HOLD_RAMP_MS = 500;

/** Redraw the wheel if a resize arrived while a spin was in progress. */
function applyPendingRedraw() {
  if (!pendingRedraw) return;
  pendingRedraw = false;
  drawWheel();
}

function startHoldSpin() {

  // If already spinning (hold in progress or decelerating) do nothing
  if (isSpinning.value) {
    return false;
  }

  isSpinning.value = true;
  isHoldSpinning.value = true;

  // Unlock audio while we are still inside the pointer gesture
  unlockAudio();

  // Emit spin start event (clears previous winner, sets UI state)
  emits('spin-start');

  holdLastTimestamp = null;
  holdLastSliceIndex = -1;
  holdStartTimestamp = null;
  holdCurrentSpeed = 0;

  // Fixed for the duration of the hold — avoids re-filtering slices per frame
  const holdSliceCount = getSlices().length;
  const holdAnglePerSlice = holdSliceCount > 0 ? 360 / holdSliceCount : 360;
  const holdCursorAngle = getCursorAngle();

  const loop = (timestamp) => {
    if (!isHoldSpinning.value) return;

    if (holdLastTimestamp === null) {
      holdLastTimestamp = timestamp;
    }
    if (holdStartTimestamp === null) {
      holdStartTimestamp = timestamp;
    }
    const dtSeconds = Math.min((timestamp - holdLastTimestamp) / 1000, 0.05);
    holdLastTimestamp = timestamp;

    // Ramp the speed up smoothly from rest (quadratic ease-out) so pressing
    // the button never jerks the wheel from 0 to full speed in one frame
    const rampT = Math.min((timestamp - holdStartTimestamp) / HOLD_RAMP_MS, 1);
    const speed = props.holdSpeed * (1 - Math.pow(1 - rampT, 2));
    holdCurrentSpeed = speed;

    // Advance rotation at the (ramped) hold speed
    currentAngle.value = getNormalizedAngle(currentAngle.value + (speed * dtSeconds));
    getCanvas().style.transform = `rotate3d(0, 0, 1, ${currentAngle.value}deg)`;

    // Tick sound when crossing slice boundaries
    const sliceIndex = Math.floor(getNormalizedAngle(holdCursorAngle - currentAngle.value) / holdAnglePerSlice);
    if (sliceIndex !== holdLastSliceIndex) {
      playTick();
      holdLastSliceIndex = sliceIndex;
    }

    holdRafId = requestAnimationFrame(loop);
  };

  holdRafId = requestAnimationFrame(loop);

  // Auto-slowdown: if the button is held for too long, decelerate on its own
  // so the wheel never spins forever. Winner index is relative to the same
  // filtered slice list the parent uses, so onSpinEnd maps it correctly.
  holdTimer = setTimeout(() => {
    if (isHoldSpinning.value) {
      const winner = Math.floor(Math.random() * getSlices().length);
      releaseHoldSpin(winner);
    }
  }, props.holdMaxDuration);

}

function releaseHoldSpin(winnerIndex) {

  // Only acts when a hold-spin is in progress
  if (!isHoldSpinning.value) {
    return false;
  }

  // Stop the continuous hold rotation
  isHoldSpinning.value = false;
  if (holdRafId) {
    cancelAnimationFrame(holdRafId);
    holdRafId = null;
  }
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }

  // Winner to land on
  const winner = winnerIndex == null ? 0 : winnerIndex;

  // Decelerate from wherever the wheel currently is down to the winner slice
  const startAngle = currentAngle.value;
  const {
    endAngle: winnerEndAngle
  } = getSliceAngles(winner, startAngle);

  const targetAngle = startAngle + (props.holdDecelSpins * 360) + (getCursorAngle() - winnerEndAngle) + getRandomBetween(1, getAnglePerSlice());

  // Velocity-continuous landing: keep the wheel's actual current speed and
  // decelerate uniformly to a stop exactly on the target (no stop-then-restart)
  const speed0 = Math.max(holdCurrentSpeed, 0);
  if (speed0 < 30) {
    // Released (almost) immediately — the wheel barely moved, so run a normal
    // launch-and-coast spin from rest instead
    animateToTarget(startAngle, targetAngle, props.spinDuration, winner);
  } else {
    animateDeceleration(startAngle, targetAngle, speed0, winner);
  }

  return true;

}

/**
 * Physics-based deceleration with velocity continuity: at release the wheel is
 * moving at `initialSpeed` (deg/s); it decelerates at a constant rate and comes
 * to rest exactly at `targetAngle`. Uniform deceleration (like friction) makes
 * the whole slowdown one continuous, smooth motion.
 */
function animateDeceleration(startAngle, targetAngle, initialSpeed, winnerIndex) {

  const totalRotation = targetAngle - startAngle;

  // Constant deceleration: θ = ω²/(2α) → α = ω²/(2θ); duration T = ω/α = 2θ/ω
  const alpha = (initialSpeed * initialSpeed) / (2 * totalRotation);
  const durationMs = (initialSpeed / alpha) * 1000;

  const startTime = performance.now();
  let lastSliceIndex = -1;

  // Resolved once for the whole deceleration (see animateToTarget)
  const sliceCount = getSlices().length;
  const anglePerSlice = sliceCount > 0 ? 360 / sliceCount : 360;
  const cursorAngle = getCursorAngle();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const t = Math.min(elapsed / durationMs, 1);

    // angle(t) = start + ω·T·t − ½·α·T²·t²  →  velocity ω(t) = ω − α·t (smooth to 0)
    const rotationAngle = startAngle + (initialSpeed * (durationMs / 1000) * t) - (0.5 * alpha * (durationMs / 1000) * (durationMs / 1000) * t * t);
    getCanvas().style.transform = `rotate3d(0, 0, 1, ${rotationAngle}deg)`;

    // Tick sound when crossing slice boundaries
    const currentSliceIndex = Math.floor(getNormalizedAngle(cursorAngle - (rotationAngle % 360)) / anglePerSlice);
    if (currentSliceIndex !== lastSliceIndex) {
      playTick();
      lastSliceIndex = currentSliceIndex;
    }

    if (t < 1) {

      requestAnimationFrame(animate);

    } else {

      const final = getNormalizedAngle(targetAngle);
      getCanvas().style.transform = `rotate3d(0, 0, 1, ${final}deg)`;
      currentAngle.value = final;

      isSpinning.value = false;
      isHoldSpinning.value = false;

      playWon();

      emits('spin-end', winnerIndex);

      applyPendingRedraw();

    }

  };

  requestAnimationFrame(animate);

}

function playAudio(audio) {
  if (audio && !props.muted) {
    audio.currentTime = 0;
    audio.volume = Math.min(1, Math.max(0, Number(props.volume) || 0));
    audio.play().catch(e => console.warn('Audio play blocked:', e));
  }
}

// ─── Sound engine ────────────────────────────────────────────────────────────
// The tick fires on every slice that passes the cursor — up to ~25 times a
// second. Re-triggering an <audio> element that often costs milliseconds of
// main-thread work per tick (element reset + seek + decoder scheduling), which
// on a mid-range phone starved requestAnimationFrame and made the wheel stutter
// and take longer than its configured duration. Measured on a throttled mobile
// profile: 2637 ms of script time per spin with element playback vs 550 ms with
// sound off.
//
// Decoding both sounds once into AudioBuffers and firing lightweight one-shot
// source nodes removes essentially all of that cost, and lets ticks overlap
// instead of cutting each other off.
let audioContext = null;
let audioGain = null;
let tickBuffer = null;
let wonBuffer = null;
let lastTickAt = 0;

// Upper bound on tick scheduling, so a very fast spin on a weak device cannot
// flood the audio graph.
const MIN_TICK_INTERVAL_MS = 50;

function ensureAudioContext() {
  if (audioContext) return audioContext;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try {
    audioContext = new Ctx();
    // One shared gain node: every tick only needs a source node, instead of
    // building a new source + gain pair (and a closure) per tick.
    audioGain = audioContext.createGain();
    audioGain.gain.value = Math.min(1, Math.max(0, Number(props.volume) || 0));
    audioGain.connect(audioContext.destination);
  } catch (e) {
    audioContext = null;
    audioGain = null;
  }
  return audioContext;
}

/** Browsers only allow audio to start from a user gesture — unlock it here. */
function unlockAudio() {
  const ctx = ensureAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => { /* will retry on the next play */ });
  }
}

/**
 * Mobile browsers keep an AudioContext suspended until it is resumed inside a
 * gesture. Unlock on the first tap/keypress anywhere on the page (and again in
 * the spin handlers), so the very first tick of the first spin is audible.
 */
function attachAudioUnlock() {
  const unlockOnce = () => {
    unlockAudio();
    document.removeEventListener('pointerdown', unlockOnce);
    document.removeEventListener('keydown', unlockOnce);
  };
  document.addEventListener('pointerdown', unlockOnce, { passive: true });
  document.addEventListener('keydown', unlockOnce);
  return unlockOnce;
}

async function loadSoundBuffer(url) {
  const ctx = ensureAudioContext();
  if (!ctx || !url) return null;
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await ctx.decodeAudioData(await response.arrayBuffer());
  } catch (e) {
    return null;
  }
}

function playBuffer(buffer) {
  if (!buffer || props.muted) return;
  const ctx = ensureAudioContext();
  if (!ctx || !audioGain) return;
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioGain);
    source.start();
  } catch (e) { /* audio graph unavailable — stay silent rather than break the spin */ }
}

/** One tick, rate-limited; falls back to the audio element when Web Audio is absent. */
function playTick() {
  if (props.muted) return;
  const now = performance.now();
  if (now - lastTickAt < MIN_TICK_INTERVAL_MS) return;
  lastTickAt = now;
  if (tickBuffer) playBuffer(tickBuffer);
  else if (spinningAudio.value) playAudio(spinningAudio.value);
}

function playWon() {
  if (props.muted) return;
  if (wonBuffer) playBuffer(wonBuffer);
  else if (wonAudio.value) playAudio(wonAudio.value);
}

function stopAudio(audio) {
  if (audio) {
    audio.pause();
    audio.currentTime = 0;
  }
}

function getCursorXY() {

  const cursorAngle = getCursorAngle();
  const cursorPosition = props.cursorPosition;

  if (cursorPosition === 'edge') {

    const rotate = getNormalizedAngle(cursorAngle + 90);
    const cursorWidth = cursor.value.clientWidth;
    const cursorHeight = cursor.value.clientHeight;
    const top = Math.sin(degreesToRadians(cursorAngle)) * 50 + 50 + '%';
    const left = Math.cos(degreesToRadians(cursorAngle)) * 50 + 50 + '%';
    const additionalX = (Math.cos(degreesToRadians(cursorAngle)) * (props.cursorDistance + (cursorWidth / 2)));
    const additionalY = (Math.sin(degreesToRadians(cursorAngle)) * (props.cursorDistance + (cursorHeight / 2)));

    return {
      top: top,
      left: left,
      translateX: 'calc(-50% - ' + additionalX + 'px)',
      translateY: 'calc(-50% - ' + additionalY + 'px)',
      rotate: rotate + 'deg'
    }

  } else {

    const rotate = getNormalizedAngle(cursorAngle + 270);
    const additionalX = Math.cos(degreesToRadians(cursorAngle)) * props.cursorDistance;
    const additionalY = Math.sin(degreesToRadians(cursorAngle)) * props.cursorDistance;

    return {
      top: '50%',
      left: '50%',
      translateX: 'calc(-50% + ' + additionalX + 'px)',
      translateY: 'calc(-50% + ' + additionalY + 'px)',
      rotate: rotate + 'deg'
    }

  }

}

function positionCursor() {

  // Set cursor position
  const {top, left, translateX, translateY, rotate} = getCursorXY();

  cursor.value.style.top = top;
  cursor.value.style.left = left;
  cursor.value.style.transform = `translate3d(${translateX}, ${translateY}, 0) rotate3d(0, 0, 1, ${rotate})`;

}

function handleResize() {
  // Resizing re-creates the canvas backing store and redraws every slice, which
  // is far too expensive to run per frame — and on phones the address bar
  // hiding/showing fires resize mid-spin. Debounce it, and never interrupt a
  // spin: redraw once the wheel has settled.
  if (resizeTimer) clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeTimer = null;
    if (isSpinning.value) {
      pendingRedraw = true;
      return;
    }
    drawWheel();
  }, 180);
}

watch(() => props.slices, () => {
  drawWheel();
});

watch(() => props.cursorAngle, () => {
  positionCursor();
});

watch(() => props.cursorPosition, () => {
  positionCursor();
});

watch(() => props.cursorDistance, () => {
  positionCursor();
});

// Ticks are short one-shot buffers, so muting simply stops the next one; no
// long-running audio element needs stopping.
watch(() => props.muted, (muted) => {
  if (muted && spinningAudio.value) {
    stopAudio(spinningAudio.value);
  }
});

onBeforeMount(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (audioUnlockHandler) {
    document.removeEventListener('pointerdown', audioUnlockHandler);
    document.removeEventListener('keydown', audioUnlockHandler);
    audioUnlockHandler = null;
  }
  if (resizeTimer) {
    clearTimeout(resizeTimer);
    resizeTimer = null;
  }
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  if (holdRafId) {
    cancelAnimationFrame(holdRafId);
    holdRafId = null;
  }
  if (audioContext) {
    try { audioContext.close(); } catch (e) { /* already closed */ }
    audioContext = null;
  }
});

onMounted(() => {

  // Keep audio elements as a fallback for browsers without Web Audio
  if (props.sounds?.spinning) {
    spinningAudio.value = new Audio(props.sounds?.spinning);
  }

  if (props.sounds?.won) {
    wonAudio.value = new Audio(props.sounds?.won);
  }

  // Decode both sounds up front so the very first tick is not delayed by a
  // fetch. Failures (offline, unsupported) fall back to the audio elements.
  (async () => {
    tickBuffer = await loadSoundBuffer(props.sounds?.spinning);
    wonBuffer = await loadSoundBuffer(props.sounds?.won);
  })();

  audioUnlockHandler = attachAudioUnlock();

  drawWheel();

});

defineExpose({
  spinWheel,
  drawWheel,
  startHoldSpin,
  releaseHoldSpin
});

</script>

<style scoped>

.wheel-wrapper {
  max-width: 100vw;
  width: 100%;
  position: relative;
  aspect-ratio: 1 / 1;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  box-sizing: border-box;
}

@media (max-width: 768px) {
  .wheel-wrapper {
    max-width: 90vw;
    margin: 0 auto;
  }
  
  canvas {
    max-width: 100%;
    max-height: 80vh;
  }
}

.cursor {
  position: absolute;
  z-index: 10;
}

.centered {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 11;
}

canvas {
  /* Only transform changes per frame; hinting width/height would force a
     needless re-layout/rasterisation on every resize. */
  will-change: transform;
  aspect-ratio: 1 / 1;
  max-width: 100%;
  width: 100%;
  height: auto;
}

</style>
