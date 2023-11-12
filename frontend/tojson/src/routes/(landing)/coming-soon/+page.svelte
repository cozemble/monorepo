<script lang="ts">
  import EmailOnRelease from '$lib/components/EmailOnRelease.svelte'
</script>

<section
  class="p-4 flex-grow flex flex-col justify-center items-center text-center
         bg-gradient-to-b from-secondary to-transparent rounded-xl"
>
  <h1 class="mb-6 text-3xl md:text-5xl lg:text-7xl text-white">Coming Soon</h1>

  <p class="mb-20 md:text-lg lg:text-xl text-white font-light">
    This page is not yet ready. It will be available with the next release.
  </p>

  <div class="flex flex-col sm:flex-row items-center gap-5">
    <EmailOnRelease />
    <a class="btn" href="/">Go Home</a>
  </div>
</section>
