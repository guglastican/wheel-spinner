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

      <!-- Added SEO Content Section -->
      <section class="seo-content-section">
        <h3>Why Use a Yes/No Wheel?</h3>
        <p>
          Life is full of choices, and sometimes the simplest ones are the hardest. Our Yes/No Wheel Spinner is the perfect decision maker when you're stuck. It's a fun and fast way to get a random choice, acting as a quick yes or no generator. 
        </p>
        <ul>
          <li><strong>Settle Debates:</strong> Quickly resolve friendly arguments or disagreements.</li>
          <li><strong>Make Quick Decisions:</strong> Decide on dinner, movie night, or simple daily choices effortlessly.</li>
          <li><strong>Add Fun:</strong> Inject randomness and excitement into group activities or personal choices.</li>
          <li><strong>Overcome Indecision:</strong> Let the wheel break the deadlock when you're truly undecided.</li>
        </ul>
        <p>
          Whether you need a simple yes or no, or want to add 'maybe' for more nuance, this fun decision tool provides an unbiased answer instantly. Spin the wheel and let fate decide!
        </p>
      </section>
      <!-- End SEO Content Section -->

      <!-- Added More Content Section -->
      <section class="more-content-section">
        <h3>Beyond Simple Choices: More Uses</h3>
        <p>
          While great for straightforward yes/no questions, this tool can be surprisingly versatile:
        </p>
        <ul>
          <li><strong>Learning & Study Aid:</strong> Quiz yourself! Frame questions with a yes/no answer and spin the wheel.</li>
          <li><strong>Creative Prompts:</strong> Stuck on a story or project? Use the wheel for binary creative decisions (e.g., "Should the character turn left?").</li>
          <li><strong>Breaking Habits:</strong> Trying to decide whether to indulge in a minor temptation? Let the wheel add a layer of chance.</li>
          <li><strong>Fair Turn-Taking:</strong> Use it in games or group settings to decide who goes next or performs a task.</li>
        </ul>
        <h3>The Power of Randomness</h3>
        <p>
          Our wheel uses a reliable pseudo-random number generator to ensure each spin is fair and unpredictable. This removes personal bias from simple decisions, making it a truly impartial decision maker. Sometimes, leaving small choices to chance can free up mental energy for more important matters! The optional 'Maybe' adds flexibility for those times when a simple yes or no isn't quite enough.
        </p>
      </section>
      <!-- End More Content Section -->

    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Rando Wheel Spinner. All rights reserved.</p> <!-- Updated copyright name -->
    </footer>
  </div>
</template>

<script setup>
// Using script setup again, but without useHead due to previous issues
import YesNoWheel from '../components/YesNoWheel.vue';
import AppHeader from '../components/AppHeader.vue';

// Meta tags will rely on index.html or server config for now.
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

/* Added styles for SEO section */
.seo-content-section {
  background-color: #fff; /* White background */
  padding: 30px;
  border: 1px solid #eee; /* Lighter border */
  border-radius: 8px;
  max-width: 800px;
  margin: 40px auto 0; /* Add margin top */
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.seo-content-section h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.seo-content-section p {
  color: #555;
  line-height: 1.7; /* Slightly more line height */
  margin-bottom: 15px;
}

.seo-content-section ul {
  list-style: disc;
  padding-left: 25px;
  margin-bottom: 15px;
}

.seo-content-section li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #555;
}

/* Added styles for the new content section */
.more-content-section {
  background-color: #f9f9f9; /* Match info section style */
  padding: 30px;
  border-radius: 8px;
  max-width: 800px;
  margin: 40px auto 0; 
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.more-content-section h3 {
  font-size: 24px;
  color: #333;
  margin-bottom: 15px;
}

.more-content-section p {
  color: #555;
  line-height: 1.7; 
  margin-bottom: 15px;
}

.more-content-section ul {
  list-style: disc;
  padding-left: 25px;
  margin-bottom: 15px;
}

.more-content-section li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #555;
}


/* REMOVED Header media query styles */
</style>
