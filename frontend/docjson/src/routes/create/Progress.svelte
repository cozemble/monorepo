<script lang="ts">
  import Icon from '@iconify/svelte'

  export let message: string = 'Initializing the process'
  export let progress: number
</script>

<!-- @component 
  Progress indicator for the create page
-->

<div class="progress-area w-full flex flex-col items-center justify-center ">
  <!-- message -->
  <p class="mb-4 text-center ">
  <!-- TODO determine which orientation to use-->
  <!-- <div class="flex gap-4"> -->
  <p class="mb-4 text-center opacity-40">
    {message}
  </p>

  <span class="swap swap-flip mb-6  hover:cursor-default" class:swap-active={progress >= 1}>
    <Icon icon="subway:tick" class="swap-on text-2xl text-secondary" />
    <span class="swap-off loading loading-md loading-dots" />
  </span>
  <!-- </div> -->

  <progress
    class="progress progress-secondary w-full h-3 justify-self-end transition ease-in"
    value={progress}
  />
</div>
