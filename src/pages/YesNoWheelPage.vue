<template>
  <div class="yes-no-wheel-page">
    <AppHeader title="Yes/No Wheel Picker" /> <!-- Use shared header -->

    <main class="main-content">
      <section class="intro-section">
        <h2>Make Quick Yes/No Decisions</h2>
        <p>
          Can't decide between yes and no? Let our wheel decide for you! 
          Customize the wheel with different modes and input sets to get the answer you need.
        </p>
      </section>

      <YesNoWheel />

      <section class="info-section">
        <h3>How to Use</h3>
        <ol>
          <li>Choose between "YES or NO" mode or "YES NO or MAYBE" mode</li>
          <li>Select the number of input sets (1-5) to adjust the probability distribution</li>
          <li>Click the "Spin" button to get your answer</li>
          <li>The result will be highlighted and counted in the boxes above</li>
          <li>Use the "Reset Results" button to clear all counters</li>
        </ol>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Vue Wheel Spinner. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup> // Changed to script setup
import YesNoWheel from '../components/YesNoWheel.vue';
import AppHeader from '../components/AppHeader.vue'; // Import shared header
</script>

<style scoped>
.yes-no-wheel-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* REMOVED Header, Logo, Navigation styles - now in AppHeader.vue */

.main-content {
  display: center;
  flex-direction: column;
  gap: 40px;
}

.intro-section {
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
}

.intro-section h2 {
  font-size: 32px;
  color: #333;
  margin-bottom: 15px;
}

.intro-section p {
  font-size: 18px;
  color: #666;
  line-height: 1.6;
}

.info-section {
  background-color: #f9f9f9;
  padding: 30px;
  border-radius: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.info-section h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.info-section ol {
  padding-left: 20px;
}

.info-section li {
  margin-bottom: 10px;
  line-height: 1.5;
  color: #555;
}

.footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
}

/* REMOVED Header media query styles */
</style>
