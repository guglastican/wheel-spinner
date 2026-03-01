<template>
  <div class="food-wheel-page">
    <AppHeader title="Food Wheel" />

    <main class="main-content">

      <!-- The Wheel -->
      <MainWheelSpinner :initial-slices="foodOptions" />

      <!-- Hero Intro -->
      <section class="hero-section">
        <h1 class="hero-title">Food Wheel — What Should I Eat?</h1>
        <p class="hero-description">
          Can't decide what to eat for lunch or dinner? Spin the <strong>Food Wheel</strong> and let fate decide! 
          Whether you are craving pizza, sushi, or looking for a healthy salad, just add your options, give the wheel a spin, and your meal is set. 
          Perfect for couples, families, or anyone experiencing indecision at dinner time.
        </p>
      </section>

      <!-- How To Use -->
      <section class="info-section">
        <h2>How to Use the Food Wheel</h2>
        <ol class="steps-list">
          <li>
            <strong>Add Cravings and Options</strong> — Type each food name or restaurant in the input box and press <em>Enter</em>
            or click the <em>+</em> button to add it to the wheel.
          </li>
          <li>
            <strong>Customise Colours</strong> — Click the colour swatch next to any food to
            change the slice colour.
          </li>
          <li>
            <strong>Spin the Wheel</strong> — Click <em>Spin the Wheel</em> or the centre button
            on the wheel. It will spin and land on a random meal.
          </li>
          <li>
            <strong>See the Winner</strong> — The chosen food appears above the wheel with a 🎉
            celebration. You can finally stop debating and start eating!
          </li>
          <li>
            <strong>Spin Again</strong> — Still not convinced? Keep spinning or remove the options you don't like using the <em>Remove</em> feature.
          </li>
        </ol>
      </section>

      <!-- SEO Section 1 -->
      <section class="seo-section">
        <h2>What Is a Food Wheel?</h2>
        <p>
          A <strong>Food Wheel</strong> is a digital spinning wheel specifically used for picking
          random meals, restaurants, or cuisines from a list. It solves the classic "What do you want to eat?" problem. You add any
          options you or your group are considering, click spin, and the wheel lands on a random choice. 
          You can also use our
          <router-link to="/wheel-of-names" class="inline-link">Wheel of Names</router-link> for picking who pays, or the
          <router-link to="/yes-no-wheel" class="inline-link">Yes/No Wheel</router-link>
          for answering questions like "Should we get dessert?":
        </p>
        <ul>
          <li>
            <strong>Restaurant decider</strong> — Can't agree on a restaurant? Add the top 5 choices and let the wheel choose impartially.
          </li>
          <li>
            <strong>Meal prep roulette</strong> — Make cooking fun by spinning for your proteins, carbs, and veggies for the week.
          </li>
          <li>
            <strong>Takeout randomizer</strong> — Pizza? Chinese? Thai? Spin whenever you have cravings for multiple cuisines.
          </li>
          <li>
            <strong>Office party catering</strong> — Let the team submit options and use the wheel to decide food for the next gathering.
          </li>
        </ul>
      </section>

      <!-- SEO Section 2 -->
      <section class="seo-section seo-section--alt">
        <h2>Why Use Our Food Wheel?</h2>
        <p>
          Skip the endless scrolling on delivery apps. Our <strong>Food Wheel</strong>
          helps you decide fast and fairly:
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🍔</div>
            <h3>End the Debate</h3>
            <p>
              No more "I don't know, what do you want?" Spin the wheel and the decision is made instantly, saving relationships everywhere.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant Setup</h3>
            <p>
              No account needed. Open the page, type your food options, and spin right away.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Fully Customisable</h3>
            <p>
              Add emojis, change slice colours to match the food, and exclude options mid-debate.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Fair Results</h3>
            <p>
              Cryptographically secure randomness means you're actually getting an unbiased, 100% random meal option.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Works on Mobile</h3>
            <p>
              Perfect for deciding on the go. The fully responsive design looks great on any phone or tablet browser.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3>100% Free</h3>
            <p>
              Our Food Wheel is always free, with no paywalls or required sign-ups.
            </p>
          </div>
        </div>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>

        <div class="faq-item">
          <h3>Does the Food Wheel work on my phone?</h3>
          <p>
            Yes! The Food Wheel is completely mobile-friendly. You can easily pull it up on your smartphone while hanging out with friends to pick a restaurant.
          </p>
        </div>

        <div class="faq-item">
          <h3>Are the results truly random?</h3>
          <p>
            Yes. Every spin uses a robust pseudo-random algorithm to guarantee that each food option has an equal chance of being selected.
          </p>
        </div>

        <div class="faq-item">
          <h3>Can I save my favorite food lists?</h3>
          <p>
            As long as you keep the browser tab open, your lists remain active. We recommend bookmarking the page for quick access next time you need culinary inspiration.
          </p>
        </div>
      </section>

      <!-- Internal Linking Section -->
      <section class="related-tools-section">
        <h2>Explore More Free Spinning Wheels</h2>
        <p>
          Need to make other types of decisions? Try our other tools:
        </p>
        <div class="tool-cards">
          <router-link to="/" class="tool-card">
            <div class="tool-card-icon">🎡</div>
            <h3>Random Wheel Spinner</h3>
            <p>
              The ultimate customizable wheel for practically any choice.
            </p>
          </router-link>
          <router-link to="/wheel-of-names" class="tool-card">
            <div class="tool-card-icon">👩‍🏫</div>
            <h3>Wheel of Names</h3>
            <p>
              A perfect companion for giveaways, classroom participation, or assigning tasks.
            </p>
          </router-link>
          <router-link to="/yes-no-wheel" class="tool-card">
            <div class="tool-card-icon">✅</div>
            <h3>Yes / No Wheel</h3>
            <p>
              A simple yes or no spinner to handle quick binary choices instantly.
            </p>
          </router-link>
        </div>
      </section>

    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue';

// Define the default food options
const foodOptions = ref([
  {color: '#ff6b6b', text: 'Pizza 🍕', winCount: 0},
  {color: '#feca57', text: 'Burgers 🍔', winCount: 0},
  {color: '#1dd1a1', text: 'Salad 🥗', winCount: 0},
  {color: '#5f27cd', text: 'Sushi 🍣', winCount: 0},
  {color: '#ff9f43', text: 'Tacos 🌮', winCount: 0},
  {color: '#2e86de', text: 'Pasta 🍝', winCount: 0},
  {color: '#ee5253', text: 'Chinese 🥡', winCount: 0}
]);

// Update meta tags for SEO when the component mounts
onMounted(() => {
  // Title is handled by the router guard in main.js
  const existingScript = document.getElementById('food-wheel-schema');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'food-wheel-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Food Wheel — Random Food and Restaurant Picker",
    "url": "https://randowheel.com/food-wheel",
    "description": "Can't decide what to eat? Spin the Food Wheel to pick a random food, restaurant, or cuisine. A purely random decider for your meals.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Add foods and restaurants to the wheel",
      "End the 'what's for dinner' debate",
      "Colour customisation per slice",
      "Works on mobile and desktop"
    ]
  });
  document.head.appendChild(script);
});
</script>

<style scoped>
.food-wheel-page {
  font-family: Arial, sans-serif;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0 auto;
  padding: 20px;
}

/* ── Inline anchor links ── */
.inline-link {
  color: #6c5ce7;
  text-decoration: underline;
  text-underline-offset: 2px;
  font-weight: 500;
  transition: color 0.2s ease;
}

.inline-link:hover {
  color: #4a3dbd;
  text-decoration-thickness: 2px;
}

/* ── Hero ── */
.hero-section {
  text-align: center;
  max-width: 820px;
  margin: 0 auto 40px;
}

.hero-title {
  font-size: 2.4rem;
  color: #6c5ce7;
  margin-bottom: 16px;
  line-height: 1.2;
  animation: fadeInDown 0.5s ease-out;
}

.hero-description {
  font-size: 1.15rem;
  color: #555;
  line-height: 1.7;
}

@keyframes fadeInDown {
  from { opacity: 0; transform: translateY(-18px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── How To section ── */
.info-section {
  background: #f9f9f9;
  padding: 30px;
  border-radius: 10px;
  max-width: 820px;
  margin: 40px auto 0;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
}

.info-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 18px;
}

.steps-list {
  padding-left: 22px;
  counter-reset: step-counter;
}

.steps-list li {
  margin-bottom: 12px;
  line-height: 1.65;
  color: #444;
  font-size: 1rem;
}

/* ── Generic SEO sections ── */
.seo-section {
  max-width: 820px;
  margin: 40px auto 0;
  padding: 30px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.seo-section--alt {
  background: #f9f9f9;
}

.seo-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 16px;
}

.seo-section h3 {
  font-size: 1.2rem;
  color: #333;
  margin: 24px 0 10px;
}

.seo-section p {
  color: #555;
  line-height: 1.75;
  margin-bottom: 14px;
  font-size: 1rem;
}

.seo-section ul {
  list-style: disc;
  padding-left: 24px;
  margin-bottom: 14px;
}

.seo-section li {
  margin-bottom: 10px;
  line-height: 1.7;
  color: #555;
  font-size: 1rem;
}

/* ── Feature grid ── */
.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.feature-card {
  background: #fff;
  border: 1px solid #e8e0ff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.12);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature-card h3 {
  font-size: 1rem;
  color: #333;
  margin: 0 0 8px;
}

.feature-card p {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.6;
  margin: 0;
}

/* ── FAQ ── */
.faq-section {
  max-width: 820px;
  margin: 40px auto 0;
  padding: 30px;
  background: #f9f9f9;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.faq-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 24px;
}

.faq-item {
  border-bottom: 1px solid #e8e8e8;
  padding: 16px 0;
}

.faq-item:last-child {
  border-bottom: none;
}

.faq-item h3 {
  font-size: 1.05rem;
  color: #333;
  margin: 0 0 8px;
}

.faq-item p {
  color: #555;
  line-height: 1.7;
  margin: 0;
  font-size: 0.97rem;
}

/* ── Related tools ── */
.related-tools-section {
  max-width: 820px;
  margin: 40px auto 0;
  padding: 30px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.04);
}

.related-tools-section h2 {
  font-size: 1.7rem;
  color: #6c5ce7;
  margin-bottom: 12px;
}

.related-tools-section > p {
  color: #555;
  line-height: 1.7;
  margin-bottom: 24px;
}

.tool-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.tool-card {
  display: block;
  background: #f5f0ff;
  border: 2px solid #e0d4ff;
  border-radius: 10px;
  padding: 24px 20px;
  text-decoration: none;
  transition: all 0.25s ease;
  color: inherit;
}

.tool-card:hover {
  background: #ede5ff;
  border-color: #6c5ce7;
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(108, 92, 231, 0.15);
}

.tool-card-icon {
  font-size: 2.2rem;
  margin-bottom: 10px;
}

.tool-card h3 {
  font-size: 1.05rem;
  color: #6c5ce7;
  margin: 0 0 8px;
}

.tool-card p {
  font-size: 0.9rem;
  color: #555;
  line-height: 1.6;
  margin: 0;
}

/* ── Responsive ── */
@media (max-width: 768px) {
  .hero-title {
    font-size: 1.7rem;
  }

  .info-section,
  .seo-section,
  .faq-section,
  .related-tools-section {
    padding: 20px;
    margin: 24px auto 0;
  }

  .feature-grid,
  .tool-cards {
    grid-template-columns: 1fr;
  }
}
</style>
