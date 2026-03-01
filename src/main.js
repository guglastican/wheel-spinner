import { createApp, nextTick } from 'vue'; // Import nextTick here
import { createRouter, createWebHistory } from 'vue-router';
// Removed: import { createHead } from '@vueuse/head'; 
import HomePage from './pages/HomePage.vue';
import YesNoWheelPage from './pages/YesNoWheelPage.vue';
import EmbedWheelPage from './pages/EmbedWheelPage.vue'
import EmbedConfigPage from './pages/EmbedConfigPage.vue' // Import the config page
import WheelOfNamesPage from './pages/WheelOfNamesPage.vue'
import FoodWheelPage from './pages/FoodWheelPage.vue'
import App from './App.vue'

// Define routes with meta titles and SEO tags
const routes = [
  {
    path: '/',
    component: HomePage,
    meta: {
      title: 'Rando Wheel - Fun Random Decision Maker & Wheel Spinner',
      description: 'Spin the wheel for random decisions! Create custom wheels, use the Yes/No spinner, or generate random choices. Fun, free, and easy decision-making tool.',
      canonical: 'https://randowheel.com/',
      robots: 'index, follow'
    }
  },
  {
    path: '/yes-no-wheel',
    component: YesNoWheelPage,
    meta: {
      title: 'Yes No Wheel Spinner - Quick Decision Maker',
      description: 'Can\'t decide between yes and no? Let our Yes/No wheel decide for you! Customize the wheel for quick answers.',
      canonical: 'https://randowheel.com/yes-no-wheel',
      robots: 'index, follow'
    }
  },
  {
    path: '/embed',
    component: EmbedWheelPage,
    meta: {
      title: 'Embedded Wheel',
      robots: 'noindex, nofollow'
    } // Simple title for embed
  },
  {
    path: '/configure-embed',
    component: EmbedConfigPage,
    meta: {
      title: 'Configure Embeddable Wheel - Rando Wheel',
      robots: 'noindex, nofollow'
    }
  },
  {
    path: '/wheel-of-names',
    component: WheelOfNamesPage,
    meta: {
      title: 'Wheel of Names - Free Random Name Picker | Rando Wheel',
      description: 'A free, browser-based random name picker. Add names to a spinning wheel and click spin to choose a random winner. Used for classrooms, giveaways, team selections, and more.',
      canonical: 'https://randowheel.com/wheel-of-names',
      robots: 'index, follow'
    }
  },
  {
    path: '/food-wheel',
    component: FoodWheelPage,
    meta: {
      title: 'Food Wheel - Random Food and Restaurant Picker | Rando Wheel',
      description: 'Can\'t decide what to eat? Spin the Food Wheel to pick a random food, restaurant, or cuisine. A purely random decider for your meals.',
      canonical: 'https://randowheel.com/food-wheel',
      robots: 'index, follow'
    }
  }
  // Removed route for non-existent TermsAndConditionsPage.vue
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard to update SEO tags after each navigation
router.afterEach((to) => {
  nextTick(() => { // Use imported nextTick
    document.title = to.meta.title || 'Rando Wheel'; // Fallback title

    // Update meta description
    if (to.meta.description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        metaDescription = document.createElement('meta');
        metaDescription.name = 'description';
        document.head.appendChild(metaDescription);
      }
      metaDescription.content = to.meta.description;
    }

    // Update canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (to.meta.canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement('link');
        canonicalLink.rel = 'canonical';
        document.head.appendChild(canonicalLink);
      }
      canonicalLink.href = to.meta.canonical;
    } else if (canonicalLink) {
      canonicalLink.remove();
    }

    // Update meta robots
    let metaRobots = document.querySelector('meta[name="robots"]');
    if (to.meta.robots) {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = to.meta.robots;
    } else {
      if (!metaRobots) {
        metaRobots = document.createElement('meta');
        metaRobots.name = 'robots';
        document.head.appendChild(metaRobots);
      }
      metaRobots.content = 'index, follow'; // default
    }
  });
});

// Create and mount the app
// Removed head management initialization
const app = createApp(App);
app.use(router);
app.mount('#app');

// Removed duplicated code below
