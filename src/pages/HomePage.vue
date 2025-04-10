<template>
  <div class="home-page">
    <AppHeader title="Random Wheel Spinner" /> <!-- Use shared header -->

    <main class="main-content">

      <MainWheelSpinner /> <!-- Removed ref -->

      <!-- REMOVED Embed Section -->

      <div class="wheel-description">
        <h2>What is a Random Wheel?</h2>
        <p>A Random Wheel is an interactive tool that spins to make a random selection from a set of choices. Whether you're picking names, colors, numbers, or yes/no answers, a random spinner adds fun and fairness to decision-making. Ideal for games, raffles, classroom activities, or just making everyday choices easier, random wheels are simple, engaging, and widely used. Try a random wheel spinner to add excitement to your next decision!</p>
      </div>

      <div class="wheel-description">
        <h2>How a Random Wheel Works?</h2>
        <p>A Random Wheel operates by spinning a digital wheel divided into multiple sections, each containing a unique option. When the wheel is spun, it randomly lands on one of these sections, providing an unbiased selection.</p>
        <h3>Steps to Use a Random Wheel:</h3>
        <div class="wheel-illustration">
          <img src="/wheel_inputs.png" alt="Wheel illustration" class="wheel-image">
        </div>
        <h3>Insert text:</h3>
        <div class="wheel-illustration">
          <img src="/inputs_text.png" alt="Wheel illustration" class="wheel-image">
          <p>You can typically add items (like names, tasks, or decisions) one by one or paste a whole list.</p>
        </div>
        <h3>Spin:</h3>
        <div class="wheel-illustration">
          <img src="/spin_wheel.png" alt="Wheel illustration" class="wheel-image">
          <p>Once your choices are in and you're happy with the look, just initiate the spin. There's usually a clear button like "Click to Spin!</p>
        </div>
        <ol class="steps-list">
          <li><strong>Enter Your Options</strong> – Add names, numbers, colors, or choices to the wheel.</li>
          <li><strong>Spin the Wheel</strong> – Click or tap the spin button to start the random selection process.</li>
          <li><strong>Get Instant Results</strong> – The wheel stops on a random choice, providing your answer.</li>
          <li><strong>Repeat as Needed</strong> – You can spin again for new results or customize the wheel for different decisions.</li>
        </ol>
      </div>

      <!-- Added Management & Results Section -->
      <div class="wheel-description">
        <h2>Manage Your Wheel & Results</h2>
        <p>Depending on the specific tool, you might find features like:</p>
        <ul>
          <li><strong>Modes:</strong> You might be able to choose different ways for the wheel to work, like 'Elimination' mode where the chosen option is removed for the next spin.</li>
          <li><strong>Editing:</strong> Most tools let you edit, duplicate, hide, or delete the entries you've added. You can also usually clear the whole list easily.</li>
          <li><strong>Saving/Sharing:</strong> You can often save your wheel setup (sometimes requires an account) and share it with others using a link or maybe even get code to embed it on a website.</li>
          <li><strong>Results:</strong> Some wheels might keep track of past results.</li>
        </ul>
        <h2>Other Wheel Tool</h2>
        <p>Other than the main random Wheel, there are several specialized tools of random Wheel created as well.</p>
        <ul>
        <li><strong>Name Pickers / Student Selectors:</strong> Commonly used by educators to randomly select individuals, sometimes called "Wheel of Names" or "Random Name Picker". </li>
        <li><strong>Yes/No Wheels::</strong> For simple binary decisions.</li>
        <p>Each specialized version takes the core concept of random selection and tailors it to meet distinct needs, making them handy for everything from organizing activities to settling debates with a fun, impartial twist.</p>
      </ul>
      </div>
        <!-- End Added Section -->
    
    </main>

  </div>
</template>

<script setup>
import MainWheelSpinner from '../components/MainWheelSpinner.vue';
import AppHeader from '../components/AppHeader.vue'; // Import shared header

</script>

<style scoped>
.home-page {
  font-family: Arial, sans-serif;
  max-width: 100%; /* Use 100% instead of fixed max-width */
  overflow-x: hidden; /* Prevent horizontal scroll */
  margin: 0 auto;
  padding: 20px;
}

/* REMOVED Header, Logo, Navigation styles - now in AppHeader.vue */

.main-title {
  text-align: center;
  color: #6c5ce7;
  margin-bottom: 30px;
  font-size: 2.5rem;
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.wheel-description {
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background-color: #f8f8f8;
  border-radius: 8px;
}

.wheel-description h2 {
  color: #6c5ce7;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.wheel-description p {
  color: #555;
  line-height: 1.6;
  font-size: 1.1rem;
}

/* Added list styling for the new section */
.wheel-description ul {
  list-style: disc;
  padding-left: 25px;
  margin-top: 10px;
}

.wheel-description li {
  margin-bottom: 10px;
  color: #555;
  line-height: 1.6;
}

.wheel-illustration {
  text-align: center; /* Center the image */
  margin: 20px 0;
}

.wheel-image {
  max-width: 100%; /* Ensure image scales down */
  height: auto; /* Maintain aspect ratio */
  display: block; /* Remove extra space below image */
  margin: 0 auto; /* Center block image */
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
