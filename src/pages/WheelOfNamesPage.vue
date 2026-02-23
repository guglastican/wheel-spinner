<template>
  <div class="wheel-of-names-page">
    <AppHeader title="Wheel of Names" />

    <main class="main-content">

      <!-- The Wheel -->
      <MainWheelSpinner />

      <!-- Hero Intro -->
      <section class="hero-section">
        <h1 class="hero-title">Wheel of Names — Free Random Name Picker</h1>
        <p class="hero-description">
          Type in any names, give the wheel a spin, and let fate pick a winner in seconds.
          Whether you need a <strong>random name picker</strong> for your classroom, a fair draw
          for a giveaway, or a quick way to assign tasks to your team — this free Wheel of Names
          has you covered. No sign-up, no download, works on any device.
        </p>
      </section>

      <!-- How To Use -->S
      <section class="info-section">
        <h2>How to Use the Wheel of Names</h2>
        <ol class="steps-list">
          <li>
            <strong>Add Names</strong> — Type each name in the input box and press <em>Enter</em>
            or click the <em>+</em> button to add it to the wheel.
          </li>
          <li>
            <strong>Customise Colours</strong> — Click the colour swatch next to any name to
            change the slice colour.
          </li>
          <li>
            <strong>Spin the Wheel</strong> — Click <em>Spin the Wheel</em> or the centre button
            on the wheel. It will spin and land on a random name.
          </li>
          <li>
            <strong>See the Winner</strong> — The chosen name appears above the wheel with a 🎉
            celebration. The win count tracks how many times each name has been picked.
          </li>
          <li>
            <strong>Spin Again</strong> — Keep spinning for multiple rounds. Use
            <em>Exclude</em> to remove winners from future spins, or <em>Reset</em> to start
            fresh.
          </li>
        </ol>
      </section>

      <!-- SEO Section 1 -->
      <section class="seo-section">
        <h2>What Is a Wheel of Names?</h2>
        <p>
          A <strong>Wheel of Names</strong> is a digital spinning wheel pre-designed for picking
          random names from a list. It works the same way as a classic prize wheel — you add any
          names you like, click spin, and the wheel lands on a winner at random. The concept is
          simple, but the applications are endless. It can also be used alongside our
          <router-link to="/" class="inline-link">random wheel spinner</router-link> for
          more general decisions, or the
          <router-link to="/yes-no-wheel" class="inline-link">Yes/No Wheel</router-link>
          for quick binary choices:
        </p>
        <ul>
          <li>
            <strong>Classroom random name picker</strong> — Teachers use a wheel of names to call
            on students without bias. Every student has an equal chance, keeping the class engaged
            and participation fair.
          </li>
          <li>
            <strong>Giveaways &amp; contests</strong> — Running a social-media giveaway? Add all
            participant names and spin to choose a winner your audience can trust.
          </li>
          <li>
            <strong>Team selection</strong> — Randomly split players into teams, pick a team
            captain, or assign roles in a group project.
          </li>
          <li>
            <strong>Office games &amp; icebreakers</strong> — Who presents first? Who brings
            coffee tomorrow? Let the wheel decide and keep things fun.
          </li>
          <li>
            <strong>Family decisions</strong> — Pick who chooses movie night, who does the dishes,
            or whose turn it is to walk the dog. For binary choices like this, try our
            <router-link to="/yes-no-wheel" class="inline-link">Yes/No Wheel</router-link> too.
          </li>
        </ul>
      </section>

      <!-- SEO Section 2 -->
      <section class="seo-section seo-section--alt">
        <h2>Why Use Our Wheel of Names?</h2>
        <p>
          There are many name-picker tools online, but our <strong>Rando Wheel of Names</strong>
          stands out for a handful of key reasons:
        </p>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">🎯</div>
            <h3>Truly Random</h3>
            <p>
              We use a cryptographically seeded pseudo-random number generator to ensure every
              spin is completely unpredictable. No patterns, no favourites.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">⚡</div>
            <h3>Instant Setup</h3>
            <p>
              No account needed. Open the page, type your names, and spin. The entire process
              takes under 30 seconds.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🎨</div>
            <h3>Fully Customisable</h3>
            <p>
              Change slice colours, reorder names, duplicate entries for weighted results, or
              exclude certain names from the draw.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>Win Tracking</h3>
            <p>
              The wheel tracks how many times each name has been picked across multiple rounds,
              so you always know who has won.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📱</div>
            <h3>Works on Any Device</h3>
            <p>
              Fully responsive design means the wheel looks and works great on phones, tablets,
              and desktops alike.
            </p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🆓</div>
            <h3>Always Free</h3>
            <p>
              No ads interrupting your spin, no premium tiers, and no subscription. The Wheel
              of Names is 100% free, forever.
            </p>
          </div>
        </div>
      </section>

      <!-- SEO Section 3 — Tips & tricks -->
      <section class="seo-section">
        <h2>Tips for Getting the Most Out of Your Name Wheel</h2>
        <h3>Weighted Name Picking</h3>
        <p>
          Want to increase the chances of a particular name being chosen? Simply add that name
          multiple times using the <em>Copy</em> button. Each duplicate entry gets its own slice,
          effectively doubling (or tripling) that person's probability of being picked — a great
          way to create VIP tiers in contests.
        </p>

        <h3>Elimination Mode</h3>
        <p>
          Running a tournament, quiz show, or raffle? Use the <em>Exclude</em> button (the tick
          icon) to remove each winner from subsequent spins. This ensures every participant can
          only win once, turning the wheel into a perfect bracket-free elimination tool. You can
          also try the <router-link to="/" class="inline-link">custom random wheel</router-link>
          if you want to spin prizes instead of names.
        </p>

        <h3>Shuffle for Fairness</h3>
        <p>
          If you re-use the same list of names regularly, hit the <em>Shuffle</em> button before
          spinning. Shuffling randomises the starting order of slices, adding another layer of
          unpredictability to the draw.
        </p>

        <h3>Save Your Name List</h3>
        <p>
          Need the same names every lesson or meeting? Simply keep the browser tab open — the
          names stay on the wheel until you reset or close the page. For persistent lists, paste
          names from a spreadsheet or notes app in seconds when you return.
        </p>
      </section>

      <!-- FAQ Section -->
      <section class="faq-section">
        <h2>Frequently Asked Questions</h2>

        <div class="faq-item">
          <h3>Is the Wheel of Names completely random?</h3>
          <p>
            Yes. Each spin uses JavaScript's <code>Math.random()</code> function, which generates
            a pseudo-random number to determine the winning slice. All names have an equal chance
            of being selected (unless you have duplicates for weighted draws).
          </p>
        </div>

        <div class="faq-item">
          <h3>How many names can I add to the wheel?</h3>
          <p>
            There is no hard limit — you can add as many names as you need. The wheel automatically
            resizes each slice to fit all entries. For best readability, we recommend keeping it
            under 50 names.
          </p>
        </div>

        <div class="faq-item">
          <h3>Can I save my wheel of names?</h3>
          <p>
            Your names are stored as long as the page is open. Bookmark the page after adding
            your names — reopening the same tab in most browsers will restore the state. We are
            working on shareable links so you can save and share custom wheels in the future.
          </p>
        </div>

        <div class="faq-item">
          <h3>Does the Wheel of Names work on mobile?</h3>
          <p>
            Absolutely. The wheel is fully responsive and works on iOS, Android, and any modern
            mobile browser. Tap the centre button or the "Spin the Wheel" button at the bottom
            of the input panel to spin.
          </p>
        </div>

        <div class="faq-item">
          <h3>What is the difference between the Wheel of Names and a random name generator?</h3>
          <p>
            A <em>random name generator</em> typically creates fictional names from a database.
            Our <router-link to="/wheel-of-names" class="inline-link">Wheel of Names</router-link>
            picks from the specific names <em>you</em> provide,
            making it ideal for real-world decisions where you need to choose from an existing
            list of people. For non-name decisions, check out our
            <router-link to="/" class="inline-link">random wheel spinner</router-link>.
          </p>
        </div>

        <div class="faq-item">
          <h3>Can I use this as a random student picker?</h3>
          <p>
            Yes — it is one of the most popular uses. Teachers add their class roster, then spin
            the wheel to call on a student. The win counter helps track participation so the same
            students are not asked repeatedly. For yes/no classroom votes, try the
            <router-link to="/yes-no-wheel" class="inline-link">Yes/No Wheel</router-link>.
          </p>
        </div>
      </section>

      <!-- Internal Linking Section -->
      <section class="related-tools-section">
        <h2>Explore More Free Spinning Wheels</h2>
        <p>
          Looking for a different kind of random picker? Check out our other free wheel tools:
        </p>
        <div class="tool-cards">
          <router-link to="/" class="tool-card">
            <div class="tool-card-icon">🎡</div>
            <h3>Random Wheel Spinner</h3>
            <p>
              Add any items — words, numbers, prizes — and spin for a random result. The ultimate
              custom decision-making wheel.
            </p>
          </router-link>
          <router-link to="/yes-no-wheel" class="tool-card">
            <div class="tool-card-icon">✅</div>
            <h3>Yes / No Wheel</h3>
            <p>
              Can't decide? Spin a simple Yes or No wheel — or add Maybe for a three-way outcome.
              Perfect for quick binary decisions.
            </p>
          </router-link>
        </div>
      </section>

    </main>

  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue';

// Update meta tags for SEO when the component mounts
onMounted(() => {
  // Title is handled by the router guard in main.js
  // Add/update structured data for this page
  const existingScript = document.getElementById('wheel-of-names-schema');
  if (existingScript) existingScript.remove();

  const script = document.createElement('script');
  script.id = 'wheel-of-names-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Wheel of Names — Free Random Name Picker",
    "url": "https://randowheel.com/wheel-of-names",
    "description": "A free, browser-based random name picker. Add names to a spinning wheel and click spin to choose a random winner. Used for classrooms, giveaways, team selections, and more.",
    "applicationCategory": "UtilityApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Add unlimited names to the wheel",
      "Fully random spinning algorithm",
      "Colour customisation per slice",
      "Win count tracking",
      "Exclude winners from future spins",
      "Shuffle entries",
      "Works on mobile and desktop"
    ]
  });
  document.head.appendChild(script);
});
</script>

<style scoped>
.wheel-of-names-page {
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

.faq-item code {
  background: #f0ecff;
  color: #6c5ce7;
  padding: 1px 5px;
  border-radius: 4px;
  font-size: 0.9em;
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
