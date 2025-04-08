<template>
  <div class="embed-container">
    <VueWheelSpinner
      v-if="slices.length > 0"
      :slices="slices"
      :winner-index="0"
      :cursor-position="'edge'"
      :cursor-angle="90"
      :cursor-distance="0"
      :display-center-button="false" 
      :display-shadow="false" 
    ></VueWheelSpinner> <!-- Hide the default spin button --> <!-- Optional: simplify appearance -->
    <div v-else class="loading-message">
      Loading wheel configuration...
    </div>
  </div>
</template>

<script>
import VueWheelSpinner from '../components/VueWheelSpinner.vue';
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'; // Import useRoute

export default {
  name: 'EmbedWheelPage',
  components: {
    VueWheelSpinner
  },
  setup() {
    const route = useRoute(); // Get route information
    const slices = ref([]);

    const parseConfigFromQuery = () => {
      const configParam = route.query.config;
      if (configParam) {
        try {
          // Decode the URL component and parse the JSON string
          const decodedConfig = decodeURIComponent(configParam);
          const parsedSlices = JSON.parse(decodedConfig);

          // Basic validation: check if it's an array
          if (Array.isArray(parsedSlices)) {
            // Further validation could be added here (e.g., check slice structure)
            slices.value = parsedSlices.map(slice => ({
              color: slice.color || '#cccccc', // Default color if missing
              text: slice.text || '?',       // Default text if missing
              // Add other properties if needed by VueWheelSpinner, ensure defaults
            }));
          } else {
            console.error("Embed config is not an array:", parsedSlices);
            slices.value = getDefaultSlices(); // Fallback
          }
        } catch (error) {
          console.error("Error parsing embed config:", error);
          slices.value = getDefaultSlices(); // Fallback on error
        }
      } else {
        console.warn("No config query parameter found for embed.");
        slices.value = getDefaultSlices(); // Fallback if no config
      }
    };

    const getDefaultSlices = () => {
      // Provide a default simple wheel if config is missing or invalid
      return [
        { color: '#FF0000', text: 'Option 1' },
        { color: '#00FF00', text: 'Option 2' },
        { color: '#0000FF', text: 'Option 3' },
      ];
    };

    onMounted(() => {
      parseConfigFromQuery();
    });

    // Watch for route query changes if needed, though less common for embeds
    // watch(() => route.query.config, parseConfigFromQuery);

    return {
      slices
    };
  }
}
</script>

<style scoped>
.embed-container {
  /* Ensure the container takes full available space */
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0; /* Remove padding */
  margin: 0; /* Remove margin */
  overflow: hidden; /* Prevent scrollbars within the embed itself */
  background-color: transparent; /* Make background transparent */
}

/* Ensure the wheel component itself fills the container */
.embed-container > :deep(.vue-wheel-spinner) { /* Use :deep to target child */
  width: 100% !important;
  height: 100% !important;
  max-width: none !important; /* Override any max-width */
  max-height: none !important; /* Override any max-height */
}

.loading-message {
  font-family: sans-serif;
  color: #555;
}
</style>
