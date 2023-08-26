<script lang="ts">
  export let message: string = 'Initializing the process'
  export let progress: number
</script>

<!-- @component 
  Progress indicator for the create page
-->

<div class="progress-area w-full flex flex-col items-center justify-center ">
  <!-- message -->
  <p class="mb-4 text-center ">
    {message}
  </p>

  <span class="loading loading-md loading-dots mb-4" />

  <progress
    class="progress progress-secondary w-full h-3 justify-self-end transition ease-in"
    value={progress}
  />
</div>
