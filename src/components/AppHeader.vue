<template>
  <header class="app-header">
    <div class="logo">
      <svg viewBox="0 0 24 24" width="30" height="30">
        <circle cx="12" cy="12" r="10" fill="#6c5ce7" />
        <path d="M12 2L14 6L18 7L15 10L16 14L12 12L8 14L9 10L6 7L10 6L12 2Z" fill="#ffeaa7" />
      </svg>
      <h1>{{ title }}</h1>
    </div>
    <nav class="navigation">
      <!-- Use router-link for SPA navigation and active class handling -->
      <router-link to="/" class="nav-link">Random Wheel </router-link>
      <router-link to="/yes-no-wheel" class="nav-link">Yes/No Wheel</router-link>
      <router-link to="/configure-embed" class="nav-link">Embed</router-link>
    </nav>
  </header>
</template>

<script setup>
import { defineProps } from 'vue';

// Define props for the component (e.g., title)
defineProps({
  title: {
    type: String,
    required: true
  }
});
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
