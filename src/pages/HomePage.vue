<template>
  <div class="home-page">
    <AppHeader :title="$t('home.mainTitle')" />

    <main class="main-content">
      <MainWheelSpinner />
      <div class="wheel-description">
        <h2>{{ $t('home.whatIsTitle') }}</h2>
        <p>{{ $t('home.whatIsDesc') }}</p>
      </div>

      <div class="wheel-description">
        <h2>{{ $t('home.howWorksTitle') }}</h2>
        <p>{{ $t('home.howWorksDesc') }}</p>
        <h3>{{ $t('home.stepsTitle') }}</h3>
        
        <div class="wheel-illustration">
          <img src="/wheel_inputs.png" alt="Wheel illustration" class="wheel-image">
        </div>
        
        <h3>{{ $t('home.step1Title') }}</h3>
        <div class="wheel-illustration">
          <img src="/inputs_text.png" alt="Wheel illustration" class="wheel-image">
          <p>{{ $t('home.step1Desc') }}</p>
        </div>
        
        <h3>{{ $t('home.step2Title') }}</h3>
        <div class="wheel-illustration">
          <img src="/spin_wheel.png" alt="Wheel illustration" class="wheel-image">
          <p>{{ $t('home.step2Desc') }}</p>
        </div>
        
        <ol class="steps-list">
          <li v-html="$t('home.stepsList.1')"></li>
          <li v-html="$t('home.stepsList.2')"></li>
          <li v-html="$t('home.stepsList.3')"></li>
          <li v-html="$t('home.stepsList.4')"></li>
        </ol>
      </div>

      <div class="wheel-description">
        <h2>{{ $t('home.manageTitle') }}</h2>
        <p>{{ $t('home.manageDesc') }}</p>
        <ul>
          <li v-html="$t('home.manageList.modes')"></li>
          <li v-html="$t('home.manageList.editing')"></li>
          <li v-html="$t('home.manageList.sharing')"></li>
          <li v-html="$t('home.manageList.results')"></li>
        </ul>
        
        <h2>{{ $t('home.otherToolsTitle') }}</h2>
        <p>{{ $t('home.otherToolsDesc') }}</p>
        <ul>
          <li><strong><router-link :to="localePath('/wheel-of-names')">{{ $t('header.wheelOfNames') }}</router-link>:</strong> <span v-html="$t('home.otherToolsList.names') && $t('home.otherToolsList.names').split('</strong>') ? $t('home.otherToolsList.names').split('</strong>')[1] : ''"></span></li>
          <li><strong><router-link :to="localePath('/yes-no-wheel')">{{ $t('header.yesNoWheel') }}</router-link>:</strong> <span v-html="$t('home.otherToolsList.yesno') && $t('home.otherToolsList.yesno').split('</strong>') ? $t('home.otherToolsList.yesno').split('</strong>')[1] : ''"></span></li>
          <li><strong><router-link :to="localePath('/food-wheel')">{{ $t('header.foodWheel') }}</router-link>:</strong> <span v-html="$t('home.otherToolsList.food') && $t('home.otherToolsList.food').split('</strong>') ? $t('home.otherToolsList.food').split('</strong>')[1] : ''"></span></li>
        </ul>
        <p>{{ $t('home.otherToolsOutro') }}</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const localePath = (path) => {
  const currentLang = locale.value;
  if (currentLang === 'en') return path;
  if (path === '/') return `/${currentLang}`;
  return `/${currentLang}${path}`;
};
</script>

<style scoped>
.home-page {
  font-family: Arial, sans-serif;
  max-width: 100%; /* Use 100% instead of fixed max-width */
  overflow-x: hidden; /* Prevent horizontal scroll */
  margin: 0 auto;
  padding: 20px;
}

/* REMOVED Header, Logo, Navigation styles - now in AppHeader.vue */

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

/* Added list styling for the new section */
.wheel-description ul {
  list-style: disc;
  padding-left: 25px;
  margin-top: 10px;
}

.wheel-description li {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.6;
}

.wheel-illustration {
  text-align: center; /* Center the image */
  margin: 20px 0;
}

.wheel-image {
  max-width: 100%; /* Ensure image scales down */
  height: auto; /* Maintain aspect ratio */
  display: block; /* Remove extra space below image */
  margin: 0 auto; /* Center block image */
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
