<script lang="ts">
  import FileDrop from '$lib/components/FileDrop.svelte'

  let files: FileList | null = null
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

    <!-- TODO file drop input -->

    <div>
      <FileDrop bind:files />
    </div>

    <!-- TODO list of previous schemas -->
  </div>
</section>
