<template>
  <div class="app-container">
    <router-view></router-view>
    <AppFooter />
  </div>
</template>

<script>
import AppFooter from './components/AppFooter.vue'

export default {
  name: 'App',
  components: {
    AppFooter
  }
}
</script>

<style>
body {
  margin: 0;
  padding: 0;
  font-family: Arial, sans-serif;
  background-color: #f8f9fa;
  color: #333;
  min-height: 100vh;
}

* {
  box-sizing: border-box;
}

.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
