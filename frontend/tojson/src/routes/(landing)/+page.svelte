<script lang="ts">
  import EmailOnRelease from '$lib/components/EmailOnRelease.svelte'
  import Icon from '@iconify/svelte'
  import TryItForm from './TryItForm.svelte'

  const features = [
    ['Handles', ' horrible, complex documents. Ugly docs, clean JSON'],
    ['No coding required.', ' We use wizards and AI'],
    ['You define', ' the JSON you want'],
    ['Send it where you want.', ' Zapier, Google sheets, your app - your choice'],
  ]
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content flex flex-col md:flex-row gap-12 lg:gap-[10em]">
    <div class="flex-grow-0 min-w">
      <h1
        class="mb-8 relative xl:text-5xl font-bold 
        !leading-[1.2] tracking-tighter [word-spacing:0.06em]"
      >
        Quickly and easily create <span
          class="bg-gradient-to-r from-accent to-primary rounded-lg px-3 text-base-100">APIs</span
        >
        to convert
        <span
          class="text-primary relative 
                bg-gradient-to-r from-primary to-secondary bg-clip-text 
                text-transparent whitespace-nowrap"
        >
          <div
            class="bg-gradient-to-r from-primary to-secondary
                  rounded-lg blur-lg opacity-10 absolute inset-0"
          />
          files to JSON
        </span>
      </h1>

      <!-- Subheading - disabled -->
      <!-- <p
        class="mb-4 sm:mb-12 opacity-60 lg:text-lg leading-relaxed tracking-tighter [word-spacing:0.1em]
      "
      >
        Auto-read data from your <span class="text-secondary">documents or text data</span> and organize
        it in the structure you want, with help from AI.
      </p> -->

      <!-- Features as a list -->
      <ul class="mb-12">
        {#each features as feat}
          <li>
            <p
              class="opacity-60 leading-none tracking-tighter [word-spacing:0.1em] py-1
          "
            >
              <Icon icon="mdi:check" class="text-secondary text-lg inline mr-2" />

              <span class="text-primary tracking-tighter font-medium [word-spacing:0.1em]">
                {feat[0]}
              </span>

              {feat[1]}
            </p>
          </li>
        {/each}
      </ul>

      <div class="flex xs-only:justify-center">
        <EmailOnRelease />
      </div>
    </div>

    <TryItForm />
  </div>
</section>
