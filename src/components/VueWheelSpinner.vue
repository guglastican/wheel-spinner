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
    default: 15
  },
  spinDuration: {
    type: Number,
    default: 14000
  },
  holdSpeed: {
    type: Number,
    default: 420
  },
  holdDecelSpins: {
    type: Number,
    default: 8
  },
  holdDecelDuration: {
    type: Number,
    default: 5000
  },
  holdMaxDuration: {
    type: Number,
    default: 15000
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

function getEaseOutQuint(x) {
  // Lower exponent (3) with higher spin count makes the slow-down much more visible and dramatic
  return 1 - Math.pow(1 - x, 3);
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

  canvas.width = containerWidth;
  canvas.height = containerHeight;

  // Adjust width and height
  const width = containerWidth;
  const height = containerHeight;
  context.scale(1, 1);

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
 * easing out (quintic) over `duration` ms and ending on the winner slice.
 * Used both by classic spinWheel and by hold-to-spin release.
 */
function animateToTarget(startAngle, targetAngle, duration, winnerIndex) {

  const totalRotation = targetAngle - startAngle;

  // Get start time to finish spinning
  const startTime = performance.now();
  let lastSliceIndex = -1;

  // Create animation
  const animate = (currentTime) => {

    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    let rotationAngle = startAngle + (totalRotation * getEaseOutQuint(progress));
    getCanvas().style.transform = `rotate3d(0, 0, 1, ${rotationAngle}deg)`;

    // Calculate current slice under cursor for ticking sound
    const slices = getSlices();
    const anglePerSlice = 360 / slices.length;
    // Normalize rotation angle for slice calculation
    const normalizedRotation = rotationAngle % 360;
    // Calculate which slice index is currently at the cursor position
    const currentSliceIndex = Math.floor(getNormalizedAngle(getCursorAngle() - normalizedRotation) / anglePerSlice);

    if (currentSliceIndex !== lastSliceIndex) {
      if (spinningAudio.value && progress < 1) {
        playAudio(spinningAudio.value);
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

      if (wonAudio.value) {
        wonAudio.value.play();
      }

      emits('spin-end', winnerIndex);

      // Stop spinning sound
      if (spinningAudio.value) {
        stopAudio(spinningAudio.value);
      }

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

function startHoldSpin() {

  // If already spinning (hold in progress or decelerating) do nothing
  if (isSpinning.value) {
    return false;
  }

  isSpinning.value = true;
  isHoldSpinning.value = true;

  // Emit spin start event (clears previous winner, sets UI state)
  emits('spin-start');

  holdLastTimestamp = null;
  holdLastSliceIndex = -1;

  const loop = (timestamp) => {
    if (!isHoldSpinning.value) return;

    if (holdLastTimestamp === null) {
      holdLastTimestamp = timestamp;
    }
    const dtSeconds = Math.min((timestamp - holdLastTimestamp) / 1000, 0.05);
    holdLastTimestamp = timestamp;

    // Advance rotation at constant hold speed
    currentAngle.value = getNormalizedAngle(currentAngle.value + (props.holdSpeed * dtSeconds));
    getCanvas().style.transform = `rotate3d(0, 0, 1, ${currentAngle.value}deg)`;

    // Tick sound when crossing slice boundaries
    const slices = getSlices();
    const anglePerSlice = 360 / slices.length;
    const sliceIndex = Math.floor(getNormalizedAngle(getCursorAngle() - currentAngle.value) / anglePerSlice);
    if (sliceIndex !== holdLastSliceIndex) {
      if (spinningAudio.value) {
        playAudio(spinningAudio.value);
      }
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

  animateToTarget(startAngle, targetAngle, props.holdDecelDuration, winner);

  return true;

}

function playAudio(audio) {
  if (audio) {
    audio.currentTime = 0;
    audio.volume = 0.5;
    audio.play().catch(e => console.warn('Audio play blocked:', e));
  }
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
  drawWheel();
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

onBeforeMount(() => {
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
  if (holdTimer) {
    clearTimeout(holdTimer);
    holdTimer = null;
  }
  if (holdRafId) {
    cancelAnimationFrame(holdRafId);
    holdRafId = null;
  }
});

onMounted(() => {

  if (props.sounds?.spinning) {
    spinningAudio.value = new Audio(props.sounds?.spinning);
  }

  if (props.sounds?.won) {
    wonAudio.value = new Audio(props.sounds?.won);
  }

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
  will-change: transform, width, height;
  aspect-ratio: 1 / 1;
  max-width: 100%;
}

</style>
