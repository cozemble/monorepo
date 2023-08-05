<script lang="ts">
  import FileDrop from '$lib/components/FileDrop.svelte'

  let files: FileList | null = null
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content">
    <h1>Streamline your workflow with easy file to JSON conversions</h1>
    <p>Pick a document to create schema of</p>
    <!-- TODO file drop input -->

    <div>
      <FileDrop bind:files />
    </div>

    <!-- TODO list of previous schemas -->
  </div>
</section>
