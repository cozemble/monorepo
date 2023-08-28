<script lang="ts">
  import TryItForm from './TryItForm.svelte'
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content flex flex-col md:flex-row gap-12 lg:gap-[10em]">
    <div class="flex-grow-0 min-w">
      <h1 class="mb-6 xl:text-5xl font-extrabold xl:mb-8">
        Streamline your workflow with easy
        <span class="text-primary"> file to JSON </span>
        conversions
      </h1>
      <p class="lg:text-xl opacity-70 mb-4">
        Auto-read data from your <span class="text-secondary">documents or text data</span> and organize
        it in the structure you want, with help from AI.
      </p>
    </div>

    <!-- TODO catchy "Try it" indicator -->

    <!-- TODO list of previous schemas -->

    <TryItForm />
  </div>
</section>
