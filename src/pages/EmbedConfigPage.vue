<template>
  <div class="embed-config-page">
    <AppHeader title="Configure Embeddable Wheel" /> <!-- Use shared header -->

    <main class="main-content">
      <p class="instructions">
        Use the controls below to set up the content and appearance of your wheel. Then, configure the embed settings and generate the code to place it on your website.
      </p>

      <!-- Wheel Configuration (using MainWheelSpinner) -->
      <MainWheelSpinner ref="wheelConfigurator" />

      <!-- Embed Settings Section -->
      <section class="embed-settings control-section">
        <h2>Embed Settings</h2>
        <div class="setting-group">
          <label for="embedTitle">Title (for accessibility):</label>
          <input type="text" id="embedTitle" v-model="embedOptions.title" class="form-control">
        </div>
        <div class="setting-group">
          <label for="embedWidth">Width (px):</label>
          <input type="number" id="embedWidth" v-model.number="embedOptions.width" class="form-control" min="50">
        </div>
        <div class="setting-group">
          <label for="embedHeight">Height (px):</label>
          <input type="number" id="embedHeight" v-model.number="embedOptions.height" class="form-control" min="50">
        </div>
      </section>

      <!-- Embed Code Generation Section -->
      <section class="embed-code-section control-section">
        <h2>Embed Code</h2>
        <p>Copy the code below to embed this configured wheel on your website:</p>
        <textarea v-model="embedCode" readonly class="embed-code-area"></textarea>
        <button @click="generateEmbedCode" class="btn btn-primary">Generate Embed Code</button>
      </section>

    </main>

    <footer class="footer">
      <p>&copy; {{ new Date().getFullYear() }} Rando Wheel Spinner. All rights reserved.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue'; // Import shared header

const wheelConfigurator = ref(null);
const embedCode = ref('');
const embedOptions = reactive({ // Reactive object for embed settings
  title: 'Random Wheel Spinner',
  width: 400,
  height: 400,
});

const generateEmbedCode = () => {
  if (!wheelConfigurator.value || !wheelConfigurator.value.slices) {
    console.error("Wheel configurator component or its slices not available.");
    embedCode.value = 'Error generating code. Please configure the wheel first.';
    return;
  }

  // 1. Get current slices and extract relevant data
  const currentSlices = wheelConfigurator.value.slices;
  const configData = currentSlices.map(slice => ({
    text: slice.text,
    color: slice.color
  }));

  // Basic validation: Ensure there are slices to embed
  if (configData.length === 0) {
      embedCode.value = 'Please add at least one item to the wheel before generating embed code.';
      return;
  }

  // 2. Serialize and encode the data
  const configString = JSON.stringify(configData);
  const encodedConfig = encodeURIComponent(configString);

  // 3. Construct the embed URL
  const embedUrl = `${window.location.origin}/embed?config=${encodedConfig}`;

  // 4. Generate the iframe code using embedOptions
  const iframeCode = `<iframe
  src="${embedUrl}"
  width="${embedOptions.width}"
  height="${embedOptions.height}"
  frameborder="0"
  scrolling="no"
  style="border:none; overflow:hidden;"
  title="${embedOptions.title}">
</iframe>`;

  // 5. Update the reactive variable
  embedCode.value = iframeCode;
};

</script>

<style scoped>
/* Import or reuse styles from HomePage or App.vue if applicable */
.embed-config-page {
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* REMOVED Header, Logo, Navigation styles - now in AppHeader.vue */

.main-content {
  padding-top: 20px;
}

.instructions {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #eef;
  border-left: 4px solid #6c5ce7;
  border-radius: 4px;
  color: #333;
}

/* Re-using some styles for consistency */
.control-section {
  margin-top: 30px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.06);
  background-color: #fff;
}

.control-section h2 {
  font-size: 1.5em;
  font-weight: 600;
  color: #333;
  margin-top: 0;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #eee;
}

.embed-settings .setting-group {
  margin-bottom: 15px;
}

.embed-settings label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #555;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box; /* Include padding and border in element's total width/height */
}

.embed-code-area {
  width: 100%;
  min-height: 120px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.9rem;
  resize: vertical;
  margin-bottom: 15px;
  background-color: #f8f8f8;
  white-space: pre;
  overflow-wrap: break-word;
  box-sizing: border-box;
}

.btn-primary { /* Assuming primary button style exists */
  background-color: #6a29e3;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 20px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background-color: #5b4ac9;
}

.footer {
  margin-top: 60px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  text-align: center;
  color: #777;
}

/* REMOVED Header media query styles */
</style>
