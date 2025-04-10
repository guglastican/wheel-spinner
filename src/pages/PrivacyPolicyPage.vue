<template>
  <div class="privacy-page">
    <AppHeader title="Privacy Policy" />
    
    <main class="main-content">
      <section class="privacy-section">
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: April 10, 2025</p>
        
        <article class="privacy-content">
          <h2>1. Information We Collect</h2>
          <p>
            We collect minimal personal data when you use Wheel Spinner. This may include:
            browser type, IP address, and usage data through cookies and similar technologies.
          </p>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use collected information to:
            - Provide and maintain our service
            - Improve user experience
            - Analyze usage patterns
            - Prevent abuse
          </p>

          <h2>3. Cookies and Tracking</h2>
          <p>
            We use essential cookies for site functionality. Third-party services like analytics 
            may use cookies to collect anonymous usage data. You can manage cookies in your browser settings.
          </p>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell your personal data. We may share anonymized analytics with third parties 
            to improve our services.
          </p>

          <h2>5. Data Security</h2>
          <p>
            We implement reasonable security measures to protect your information, but no system 
            is 100% secure. We cannot guarantee absolute security.
          </p>

          <h2>6. Your Rights</h2>
          <p>
            You may request access to or deletion of your personal data by contacting us. 
            Some data may be retained where required by law.
          </p>

          <h2>7. Changes to This Policy</h2>
          <p>
            We may update this policy periodically. Continued use after changes constitutes acceptance.
          </p>
        </article>
      </section>
    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Vue Wheel Spinner. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import AppHeader from '../components/AppHeader.vue';
</script>

<style scoped>
.privacy-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.main-content {
  margin: 40px 0;
}

.privacy-section {
  max-width: 800px;
  margin: 0 auto;
}

.privacy-section h1 {
  font-size: 32px;
  color: #333;
  margin-bottom: 10px;
}

.last-updated {
  color: #777;
  margin-bottom: 30px;
}

.privacy-content h2 {
  font-size: 24px;
  color: #444;
  margin: 25px 0 15px;
}

.privacy-content p {
  line-height: 1.6;
  color: #555;
  margin-bottom: 15px;
}

.footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
}
</style>