<template>
  <footer class="app-footer">
    <div class="footer-content">
      
      <div class="footer-section">
        <h3 class="footer-title">Rando Wheel</h3>
        <p class="copyright">&copy; {{ new Date().getFullYear() }} Wheel Spinner</p>
        <div class="footer-links">
          <a href="/privacy-policy.html" target="_blank">Privacy Policy</a>
          <a href="/terms-and-conditions.html" target="_blank">Terms & Conditions</a>
        </div>
      </div>

      <div class="footer-section right-section">
        <h3 class="footer-title">Other Wheels</h3>
        <div class="footer-links vertical-links">
          <router-link to="/wheel-of-names">Wheel of Names</router-link>
          <router-link to="/yes-no-wheel">Yes/No Wheel</router-link>
          <router-link to="/food-wheel">Food Wheel</router-link>
        </div>
      </div>

    </div>
  </footer>
</template>

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

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 30px;
    text-align: left;
  }
}
</style>
