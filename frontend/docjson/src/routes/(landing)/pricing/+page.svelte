<script lang="ts">
  import { plans } from './'
  import EmailOnRelease from './EmailOnRelease.svelte'

  import Plan from './Plan.svelte'
</script>

<section
  class="pb-32 pt-10 px-5 flex-grow w-full rounded-2xl
  bg-gradient-to-br from-primary/75 via-30% via-accent/100 to-primary/75"
>
  <div class="mb-8 md:mt-10 md:mb-20 flex flex-col items-center">
    <h1 class="text-4xl md:text-6xl mb-[0.4em]">Pricing Plans</h1>

    <p class="mb-8 text-base md:text-xl text-base-100 text-center">
      We are currently in beta, paid plans will be available soon.
    </p>

    <EmailOnRelease />
  </div>

  <!-- TODO monthly/yearly switch if needed -->
  <div
    class="plans flex flex-wrap justify-center gap-12
  
  "
  >
    {#each plans as plan}
      <Plan {plan} />
    {/each}
  </div>
</section>
