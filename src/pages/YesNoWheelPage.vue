<template>
  <div class="yes-no-wheel-page">
    <AppHeader :title="$t('yesNoPage.title')" />

    <main class="main-content">
      <section class="intro-section">
        <h2>{{ $t('yesNoPage.heroTitle') }}</h2>
        <p>{{ $t('yesNoPage.heroDesc') }}</p>
      </section>

      <YesNoWheel />

      <section class="info-section">
        <h3>{{ $t('yesNoPage.howToTitle') }}</h3>
        <ol>
          <li>{{ $t('yesNoPage.steps.1') }}</li>
          <li>{{ $t('yesNoPage.steps.2') }}</li>
          <li>{{ $t('yesNoPage.steps.3') }}</li>
          <li>{{ $t('yesNoPage.steps.4') }}</li>
          <li>{{ $t('yesNoPage.steps.5') }}</li>
        </ol>
      </section>

      <section class="seo-content-section">
        <h3>{{ $t('yesNoPage.seoTitle') }}</h3>
        <p>{{ $t('yesNoPage.seoDesc1') }}</p>
        <ul>
          <li v-html="$t('yesNoPage.seoList.1')"></li>
          <li v-html="$t('yesNoPage.seoList.2')"></li>
          <li v-html="$t('yesNoPage.seoList.3')"></li>
          <li v-html="$t('yesNoPage.seoList.4')"></li>
        </ul>
        <p>{{ $t('yesNoPage.seoDesc2') }}</p>
      </section>

      <section class="more-content-section">
        <h3>{{ $t('yesNoPage.moreTitle') }}</h3>
        <p>{{ $t('yesNoPage.moreDesc') }}</p>
        <ul>
          <li v-html="$t('yesNoPage.moreList.1')"></li>
          <li v-html="$t('yesNoPage.moreList.2')"></li>
          <li v-html="$t('yesNoPage.moreList.3')"></li>
          <li v-html="$t('yesNoPage.moreList.4')"></li>
        </ul>
        <h3>{{ $t('yesNoPage.powerTitle') }}</h3>
        <p>{{ $t('yesNoPage.powerDesc') }}</p>
      </section>

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
  max-width: 100%; /* Use 100% instead of fixed max-width */
  overflow-x: hidden; /* Prevent horizontal scroll */
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
