<script lang="ts">
  import FileDrop from '$lib/components/FileDrop.svelte'

  let files: File[]

  $: console.log(files)
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content">
    <div>
      <h1>
        Streamline your workflow with easy
        <span class="text-primary"> file to JSON </span>
        conversions
      </h1>
      <p>Pick a document to create schema of</p>
    </div>

    <!-- TODO list of previous schemas -->

    <div
      class="card shadow-lg p-8 gap-8 bg-gradient-to-tr from-accent from-25% via-secondary via-70% to-primary"
    >
      <FileDrop bind:files />

      <div class="actions flex justify-center">
        <button class="btn btn-block btn-md text-xl normal-case shadow-xl">Start</button>
      </div>
    </div>
  </div>
</section>
