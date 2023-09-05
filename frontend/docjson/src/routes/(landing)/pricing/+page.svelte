<script lang="ts">
  import { plans } from './'

  import PricingOptionComponent from './PricingOption.svelte'
</script>

<section
  class="pb-32 pt-10 px-5 flex-grow w-full rounded-2xl
  bg-gradient-to-br from-primary/75 via-30% via-accent/100 to-primary/75"
>
  <div class="flex flex-col items-center mt-10 mb-20">
    <h1 class="text-6xl mb-[0.4em]">Pricing Plans</h1>

    <p class="text-xl text-base-100">
      We are currently in beta, paid plans will be available soon.
    </p>

    <!-- TODO notify me via email -->
  </div>

  <!-- TODO monthly/yearly switch if needed -->
  <div
    class="plans flex flex-wrap justify-center gap-10
  
  "
  >
    {#each plans as option}
      <PricingOptionComponent {option} />
    {/each}
  </div>
</section>
