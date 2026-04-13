<template>
  <header class="app-header">
    <div class="header-left">
      <div class="logo">
        <img src="/logo_random_wheel.svg" alt="Random Wheel Logo" width="30" height="30">
        <h1>{{ title }}</h1>
      </div>
      
      <!-- Custom Crawlable Language Switcher -->
      <div class="lang-dropdown" v-click-outside="closeDropdown">
        <button class="lang-dropdown-btn" @click="toggleDropdown">
          <span class="globe-icon">🌐</span>
          {{ locale.toUpperCase() }}
          <span class="arrow-down">▼</span>
        </button>
        
        <div v-if="isDropdownOpen" class="lang-dropdown-content">
          <a 
            v-for="loc in supportedLocales" 
            :key="loc" 
            :href="getLangPath(loc)"
            class="lang-dropdown-item"
            :class="{ active: loc === locale }"
            @click.prevent="selectLocale(loc)"
          >
            <span class="lang-code">{{ loc.toUpperCase() }}</span>
            <span class="lang-name">{{ getLangName(loc) }}</span>
          </a>
        </div>
      </div>
    </div>
    
    <button class="nav-toggle" @click="toggleNav" :aria-expanded="isNavOpen" aria-label="Toggle navigation">
      <span></span><span></span><span></span>
    </button>

    <nav class="navigation" :class="{ 'nav-open': isNavOpen }">
      <router-link :to="localePath('/')" class="nav-link" @click="isNavOpen = false">{{ $t('header.randomWheel') }}</router-link>
      <router-link :to="localePath('/wheel-of-names')" class="nav-link" @click="isNavOpen = false">{{ $t('header.wheelOfNames') }}</router-link>
      <router-link :to="localePath('/yes-no-wheel')" class="nav-link" @click="isNavOpen = false">{{ $t('header.yesNoWheel') }}</router-link>
      <router-link :to="localePath('/food-wheel')" class="nav-link" @click="isNavOpen = false">{{ $t('header.foodWheel') }}</router-link>
      <router-link :to="localePath('/spin-the-wheel')" class="nav-link" @click="isNavOpen = false">{{ $t('header.spinTheWheel') || 'Spin the Wheel' }}</router-link>
      <router-link :to="localePath('/twister-spinner')" class="nav-link" @click="isNavOpen = false">{{ $t('header.twisterSpinner') || 'Twister Spinner' }}</router-link>
      <router-link :to="localePath('/configure-embed')" class="nav-link" @click="isNavOpen = false">{{ $t('header.embed') }}</router-link>
    </nav>
  </header>
</template>

<script setup>
import { ref, defineProps } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { SUPPORTED_LOCALES } from '../i18n.js';

const { locale } = useI18n();
const router = useRouter();
const route = useRoute();
const isDropdownOpen = ref(false);
const isNavOpen = ref(false);

const toggleNav = () => {
  isNavOpen.value = !isNavOpen.value;
};

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

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value;
};

const closeDropdown = () => {
  isDropdownOpen.value = false;
};

const getLangPath = (targetLoc) => {
  let currentPath = route.path;
  const localePrefixRegex = new RegExp(`^/(${supportedLocales.join('|')})(/|$)`);
  if (localePrefixRegex.test(currentPath)) {
    currentPath = currentPath.replace(localePrefixRegex, '/');
  }
  if (targetLoc === 'en') return currentPath;
  return `/${targetLoc}${currentPath === '/' ? '' : currentPath}`;
};

const selectLocale = (newLocale) => {
  const newPath = getLangPath(newLocale);
  router.push(newPath);
  isDropdownOpen.value = false;
};

const getLangName = (loc) => {
  const names = {
    'en': 'English', 'es': 'Español', 'de': 'Deutsch', 'ja': '日本語', 'fr': 'Français',
    'pt': 'Português', 'zh-CN': '简体中文', 'ar': 'العربية', 'it': 'Italiano', 'ru': 'Русский',
    'hi': 'हिन्दी', 'nl': 'Nederlands', 'tr': 'Türkçe', 'ko': '한국어', 'id': 'Bahasa Indonesia',
    'vi': 'Tiếng Việt', 'pl': 'Polski', 'th': 'ไทย', 'sv': 'Svenska', 'el': 'Ελληνικά',
    'ro': 'Română', 'cs': 'Čeština', 'hu': 'Magyar', 'bn': 'বাংলা', 'he': 'עברית'
  };
  return names[loc] || loc.toUpperCase();
};

// Simple directive for clicking outside
const vClickOutside = {
  mounted(el, binding) {
    el.clickOutsideEvent = (event) => {
      if (!(el === event.target || el.contains(event.target))) {
        binding.value(event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent);
  },
  unmounted(el) {
    document.body.removeEventListener('click', el.clickOutsideEvent);
  },
};
</script>

<style scoped>
.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
  position: relative;
  z-index: 1000;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 25px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo h1 {
  font-size: 24px;
  margin: 0;
  color: #1a1a2e;
  font-weight: 700;
}

/* ── Custom Language Dropdown ── */
.lang-dropdown {
  position: relative;
}

.lang-dropdown-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 14px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  color: #475569;
  transition: all 0.2s ease;
  font-size: 14px;
}

.lang-dropdown-btn:hover {
  background: #f1f5f9;
  border-color: #cbd5e1;
}

.globe-icon {
  font-size: 16px;
}

.arrow-down {
  font-size: 10px;
  opacity: 0.6;
}

.lang-dropdown-content {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  background: white;
  min-width: 200px;
  max-height: 400px;
  overflow-y: auto;
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  padding: 8px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.lang-dropdown-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  text-decoration: none;
  color: #475569;
  border-radius: 6px;
  transition: all 0.15s ease;
}

.lang-dropdown-item:hover {
  background: #f1f5f9;
  color: #6c5ce7;
}

.lang-dropdown-item.active {
  background: #f5f3ff;
  color: #6c5ce7;
  font-weight: 600;
}

.lang-code {
  font-size: 11px;
  font-weight: 700;
  background: #f1f5f9;
  padding: 2px 6px;
  border-radius: 4px;
  color: #64748b;
  min-width: 38px;
  text-align: center;
}

.lang-name {
  font-size: 14px;
}

/* ── Navigation ── */
.nav-toggle {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
}

.nav-toggle span {
  display: block;
  width: 22px;
  height: 2px;
  background: #475569;
  border-radius: 2px;
  transition: background 0.2s;
}

.nav-toggle:hover span {
  background: #6c5ce7;
}

.navigation {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-items: center;
}

.nav-link {
  text-decoration: none;
  color: #64748b;
  font-weight: 600;
  padding: 7px 11px;
  border-radius: 8px;
  transition: all 0.2s;
  font-size: 14px;
  white-space: nowrap;
}

.nav-link:hover {
  color: #1a1a2e;
  background: #f1f5f9;
}

.nav-link.router-link-exact-active {
  color: #6c5ce7;
  background: #f5f3ff;
}

@media (max-width: 960px) {
  .app-header {
    flex-wrap: wrap;
    gap: 12px;
    padding: 16px 0;
  }

  .nav-toggle {
    display: flex;
    margin-left: auto;
  }

  .navigation {
    display: none;
    width: 100%;
    flex-direction: column;
    background: #f8fafc;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
  }

  .navigation.nav-open {
    display: flex;
  }

  .nav-link {
    font-size: 14px;
    padding: 10px 12px;
    border-radius: 8px;
  }
}
</style>
