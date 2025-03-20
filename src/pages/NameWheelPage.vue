<template>
  <div class="name-wheel-page">
    <h1>Wheel of Names</h1>
    <NameWheelSpinner />
  </div>
</template>

<script setup>
import NameWheelSpinner from '@/components/NameWheelSpinner.vue'
</script>

<style scoped>
.name-wheel-page {
  padding: 2rem;
  text-align: center;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}
</style>
