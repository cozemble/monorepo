<script lang="ts">
  import EmailOnRelease from '$lib/components/EmailOnRelease.svelte'
  import TryItForm from './TryItForm.svelte'
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content flex flex-col md:flex-row gap-12 lg:gap-[10em]">
    <div class="flex-grow-0 min-w">
      <h1
        class="mb-6 xl:mb-8 relative xl:text-5xl font-bold 
        !leading-[1.2] tracking-tighter [word-spacing:0.06em]"
      >
        Quickly and easily create <span
          class="bg-gradient-to-r from-accent to-primary rounded-lg px-3  text-base-100">APIs</span
        >
        to convert
        <span
          class="text-primary relative 
                bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent whitespace-nowrap drop-shadow-md
        "
        >
          <div
            class="bg-gradient-to-r from-primary to-secondary
                  rounded-lg blur-xl opacity-10 absolute inset-0"
          />
          files to JSON
        </span>
      </h1>
      <p class="lg:text-xl opacity-70 mb-4 sm:mb-12 ">
        Auto-read data from your <span class="text-secondary">documents or text data</span> and organize
        it in the structure you want, with help from AI.
      </p>

      <EmailOnRelease />
    </div>

    <!-- TODO catchy "Try it" indicator -->

    <!-- TODO list of previous schemas -->

    <TryItForm />
  </div>
</section>
