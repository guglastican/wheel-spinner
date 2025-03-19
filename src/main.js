import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import HomePage from './pages/HomePage.vue'
import YesNoWheelPage from './pages/YesNoWheelPage.vue'
import App from './App.vue'

// Define routes
const routes = [
  { path: '/', component: HomePage },
  { path: '/yes-no-wheel', component: YesNoWheelPage }
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
