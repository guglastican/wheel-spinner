<template>
  <footer class="app-footer">
    <div class="footer-content">
      
      <div class="footer-section">
        <h3 class="footer-title">{{ $t('footer.randoWheel') }}</h3>
        <div class="footer-links">
          <a href="/privacy-policy.html" target="_blank">{{ $t('footer.privacyPolicy') }}</a>
          <a href="/terms-and-conditions.html" target="_blank">{{ $t('footer.termsConditions') }}</a>
        </div>
      </div>

      <div class="footer-section right-section">
        <h3 class="footer-title">{{ $t('footer.otherWheels') }}</h3>
        <div class="footer-links vertical-links">
          <router-link :to="localePath('/wheel-of-names')">{{ $t('header.wheelOfNames') }}</router-link>
          <router-link :to="localePath('/yes-no-wheel')">{{ $t('header.yesNoWheel') }}</router-link>
          <router-link :to="localePath('/food-wheel')">{{ $t('header.foodWheel') }}</router-link>
          <router-link :to="localePath('/twister-spinner')">{{ $t('header.twisterSpinner') || 'Twister Spinner' }}</router-link>
          <router-link :to="localePath('/spin-the-wheel')">{{ $t('header.spinTheWheel') || 'Spin the Wheel' }}</router-link>
        </div>
      </div>

    </div>
  </footer>
</template>

<script setup>
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';


const { locale } = useI18n();
const route = useRoute();
const localePath = (path) => {
  const currentLang = locale.value;
  if (currentLang === 'en') return path;
  if (path === '/') return `/${currentLang}`;
  return `/${currentLang}${path}`;
};


</script>

<style scoped>
.app-footer {
  background-color: #f5f5f5;
  padding: 40px 0;
  margin-top: 40px;
  border-top: 1px solid #e0e0e0;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 30px;
}

.footer-section {
  display: flex;
  flex-direction: column;
}

.right-section {
  min-width: 150px;
}

.footer-title {
  font-size: 1.1rem;
  color: #333;
  margin: 0 0 15px 0;
  font-weight: 600;
}

.copyright {
  color: #777;
  margin: 0 0 15px 0;
  font-size: 0.9rem;
}

.footer-links {
  display: flex;
  gap: 15px;
}

.vertical-links {
  flex-direction: column;
  gap: 10px;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  font-size: 0.95rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: #6c5ce7;
}

.full-width {
  flex: 1 1 100%;
}

.language-links {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 10px;
  width: 100%;
}

.lang-link {
  color: #777 !important;
  font-size: 0.85rem !important;
  text-decoration: none;
  transition: color 0.2s;
}

.lang-link:hover {
  color: #6c5ce7 !important;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 30px;
    text-align: left;
  }
  .language-links {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
