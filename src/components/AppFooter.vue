<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; {{ new Date().getFullYear() }} Wheel Spinner</p>
      <div class="footer-links">
        <a href="/privacy-policy.html" target="_blank">Privacy Policy</a>
        <span class="divider">|</span>
        <a href="/terms-and-conditions.html" target="_blank">Terms & Conditions</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  background-color: #f5f5f5;
  padding: 20px 0;
  margin-top: 40px;
  border-top: 1px solid #eee;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.footer-links a {
  color: #555;
  text-decoration: none;
  margin: 0 10px;
}

.footer-links a:hover {
  color: #6c5ce7;
}

.divider {
  color: #ccc;
  margin: 0 5px;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    gap: 10px;
    text-align: center; /* Center text when stacked */
  }
}
</style>
