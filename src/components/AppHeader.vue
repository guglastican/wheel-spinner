<template>
  <header class="app-header">
    <div class="logo">
      <img src="/logo_random_wheel.svg" alt="Random Wheel Logo" width="30" height="30">
      <h1>{{ title }}</h1>
    </div>
    <nav class="navigation">
      <router-link :to="localePath('/')" class="nav-link">{{ $t('header.randomWheel') }}</router-link>
      <router-link :to="localePath('/wheel-of-names')" class="nav-link">{{ $t('header.wheelOfNames') }}</router-link>
      <router-link :to="localePath('/yes-no-wheel')" class="nav-link">{{ $t('header.yesNoWheel') }}</router-link>
      <router-link :to="localePath('/configure-embed')" class="nav-link">{{ $t('header.embed') }}</router-link>

      <select v-model="$i18n.locale" @change="changeLocale" class="lang-switcher">
        <option v-for="loc in supportedLocales" :key="loc" :value="loc">{{ loc.toUpperCase() }}</option>
      </select>
    </nav>
  </header>
</template>

<script setup>
import { defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from '../i18n.js';

const { locale } = useI18n();
const router = useRouter();
const route = useRoute();

defineProps({
  title: {
    type: String,
    required: true
  }
});

const supportedLocales = SUPPORTED_LOCALES;

const localePath = (path) => {
  const currentLang = locale.value;
  if (currentLang === 'en') return path;
  if (path === '/') return `/${currentLang}`;
  return `/${currentLang}${path}`;
};

const changeLocale = (event) => {
  const newLocale = event.target.value;
  let currentPath = route.path;
  
  // Regex to strip the locale prefix safely if it exists
  const localePrefixRegex = new RegExp(`^/(${supportedLocales.join('|')})(/|$)`);
  if (localePrefixRegex.test(currentPath)) {
    currentPath = currentPath.replace(localePrefixRegex, '/');
  }
  
  const newPath = newLocale === 'en' ? currentPath : `/${newLocale}${currentPath === '/' ? '' : currentPath}`;
  router.push(newPath);
};
</script>

<style scoped>
/* Styles copied & adapted from existing pages */
.app-header {
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

/* Vue Router automatically adds 'router-link-active' and 'router-link-exact-active' */
/* Style the active link */
.nav-link.router-link-exact-active {
  color: #6c5ce7;
  font-weight: bold;
}

@media (max-width: 768px) {
  .app-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .navigation {
    width: 100%;
    justify-content: space-around; /* Use space-around for better mobile spacing */
  }
   .logo h1 {
    font-size: 20px; /* Adjust title size */
  }
}
</style>
