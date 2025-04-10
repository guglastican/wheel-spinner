import { createApp, nextTick } from 'vue'; // Import nextTick here
import { createRouter, createWebHistory } from 'vue-router';
// Removed: import { createHead } from '@vueuse/head'; 
import HomePage from './pages/HomePage.vue';
import YesNoWheelPage from './pages/YesNoWheelPage.vue';
import EmbedWheelPage from './pages/EmbedWheelPage.vue'
import EmbedConfigPage from './pages/EmbedConfigPage.vue' // Import the config page
import App from './App.vue'

// Define routes with meta titles
const routes = [
  { 
    path: '/', 
    component: HomePage, 
    meta: { title: 'Rando Wheel - Fun Random Decision Maker & Wheel Spinner' } 
  },
  { 
    path: '/yes-no-wheel', 
    component: YesNoWheelPage, 
    meta: { title: 'Yes No Wheel Spinner - Quick Decision Maker' } 
  },
  { 
    path: '/embed', 
    component: EmbedWheelPage, 
    meta: { title: 'Embedded Wheel' } // Simple title for embed
  }, 
  {
    path: '/configure-embed',
    component: EmbedConfigPage,
    meta: { title: 'Configure Embeddable Wheel - Rando Wheel' }
  },
  {
    path: '/terms',
    component: () => import('./pages/TermsAndConditionsPage.vue'),
    meta: { title: 'Terms and Conditions - Rando Wheel' }
  }
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to update title after each navigation
router.afterEach((to, from) => {
  nextTick(() => { // Use imported nextTick
      document.title = to.meta.title || 'Rando Wheel'; // Fallback title
  });
});

// Create and mount the app
// Removed head management initialization
const app = createApp(App);
app.use(router);
app.mount('#app');

// Removed duplicated code below
