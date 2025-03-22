<template>
  <div class="home-page">
    <header class="header">
      <div class="logo">
        <svg viewBox="0 0 24 24" width="30" height="30">
          <circle cx="12" cy="12" r="10" fill="#6c5ce7" />
          <path d="M12 2L14 6L18 7L15 10L16 14L12 12L8 14L9 10L6 7L10 6L12 2Z" fill="#ffeaa7" />
        </svg>
        <h1>Random Wheel Spinner</h1>
      </div>
      <nav class="navigation">
        <a href="/" class="nav-link active">Home</a>
        <a href="/yes-no-wheel" class="nav-link">Yes/No Wheel</a>
      </nav>
    </header>

    <main class="main-content">
      
      <MainWheelSpinner />
      <div class="wheel-description">
        <h2>What is a Random Wheel?</h2>
        <p>A Random Wheel is an interactive tool that spins to make a random selection from a set of choices. Whether you're picking names, colors, numbers, or yes/no answers, a random spinner adds fun and fairness to decision-making. Ideal for games, raffles, classroom activities, or just making everyday choices easier, random wheels are simple, engaging, and widely used. Try a random wheel spinner to add excitement to your next decision!</p>
      </div>

      <div class="wheel-description">
        <h2>How a Random Wheel Works?</h2>
        <p>A Random Wheel operates by spinning a digital wheel divided into multiple sections, each containing a unique option. When the wheel is spun, it randomly lands on one of these sections, providing an unbiased selection.</p>
        <h3>Steps to Use a Random Wheel:</h3>
        <div class="wheel-illustration">
          <img src="\src\wheel inputs.png" alt="Wheel illustration" class="wheel-image">
        </div>
        <ol class="steps-list">
          <li><strong>Enter Your Options</strong> – Add names, numbers, colors, or choices to the wheel.</li>
          <li><strong>Spin the Wheel</strong> – Click or tap the spin button to start the random selection process.</li>
          <li><strong>Get Instant Results</strong> – The wheel stops on a random choice, providing your answer.</li>
          <li><strong>Repeat as Needed</strong> – You can spin again for new results or customize the wheel for different decisions.</li>
        </ol>
      </div>
    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Vue Wheel Spinner. All rights reserved.</p>
    </footer>
  </div>
</template>

<script>
import MainWheelSpinner from '../components/MainWheelSpinner.vue'

export default {
  components: {
    MainWheelSpinner
  }
}
</script>

<style scoped>
.home-page {
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

.main-title {
  text-align: center;
  color: #6c5ce7;
  margin-bottom: 30px;
  font-size: 2.5rem;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wheel-description {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.wheel-description h2 {
  color: #6c5ce7;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.wheel-description p {
  color: #555;
  line-height: 1.6;
  font-size: 1.1rem;
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
