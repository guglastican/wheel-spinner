import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import YesNoWheelPage from './pages/YesNoWheelPage.vue'
import EmbedWheelPage from './pages/EmbedWheelPage.vue'
import EmbedConfigPage from './pages/EmbedConfigPage.vue' // Import the config page
import App from './App.vue'

// Define routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/yes-no-wheel', component: YesNoWheelPage },
  { path: '/embed', component: EmbedWheelPage }, // Route for the actual embed content
  { path: '/configure-embed', component: EmbedConfigPage } // Route for configuring the embed
]

// Create router instance
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Create and mount the app
const app = createApp(App)
app.use(router)
app.mount('#app')
