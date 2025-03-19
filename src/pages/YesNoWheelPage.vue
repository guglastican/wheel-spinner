<template>
  <div class="yes-no-wheel-page">
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <circle cx="12" cy="12" r="10" fill="#6c5ce7" />
          <path d="M12 2L14 6L18 7L15 10L16 14L12 12L8 14L9 10L6 7L10 6L12 2Z" fill="#ffeaa7" />
        </svg>
        <h1>Yes/No Wheel Picker</h1>
      </div>
      <nav class="navigation">
        <a href="/" class="nav-link">Home</a>
        <a href="/yes-no-wheel" class="nav-link active">Yes/No Wheel</a>
      </nav>
    </header>

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

<script>
import YesNoWheel from '../components/YesNoWheel.vue'

export default {
  components: {
    YesNoWheel
  }
}
</script>

<style scoped>
.yes-no-wheel-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo h1 {
  font-size: 24px;
  margin: 0;
  color: #333;
}

.navigation {
  display: flex;
  gap: 20px;
}

.nav-link {
  text-decoration: none;
  color: #555;
  font-weight: 500;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.2s;
}

.nav-link:hover {
  background-color: #f5f5f5;
}

.nav-link.active {
  color: #6c5ce7;
  font-weight: bold;
}

.main-content {
  display: flex;
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

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  
  .navigation {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
