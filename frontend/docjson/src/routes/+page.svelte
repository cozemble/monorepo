<script lang="ts">
  import FileDrop from '$lib/components/FileDrop.svelte'

  let files: File[]

  function handleStart() {
    if (!files) return console.log('No files selected')

    handleOCR(files).then((res) => {
      console.log(res)
    })

    // <!-- TODO next step: create schema -->
    // <!-- TODO next step: create database and populate -->
  }

  // <!-- TODO stores to keep track of schemas -->
  // with localStorage support for visitors and server sync for users

  // <!-- TODO move to helpers -->
  async function handleOCR(files: File[]) {
    const formData = new FormData()
    formData.append('image', files[0])

    return await fetch('/api/ocr', {
      method: 'POST',
      body: formData,
    }).then((res) => res.json())
  }
</script>

<section class="hero min-h-full flex-grow">
  <div class="hero-content flex flex-col md:flex-row gap-12 lg:gap-[10em]">
    <div class="flex-grow-0 min-w">
      <h1 class="mb-6">
        Streamline your workflow with easy
        <span class="text-primary"> file to JSON </span>
        conversions
      </h1>
      <p class="lg:text-xl opacity-70">
        Auto-read data from your documents and organize it in the structure you want, with help from
        <span class="text-secondary"> AI. </span>
      </p>
    </div>

    <!-- TODO catchy "Try it" indicator -->

    <!-- TODO list of previous schemas -->

    <div
      class={`card shadow-lg p-8 gap-8 w-full flex-shrink-0
              sm:w-[40vw] sm:min-w-[24em] max-w-[30em] 
              bg-gradient-to-tr from-accent from-25% via-secondary via-70% to-primary`}
    >
      <FileDrop bind:files />

      <div
        class="tooltip {!files?.length ? 'tooltip-error' : 'tooltip-success'}"
        data-tip={!files?.length ? 'You need to select a file first' : 'Start creating a database'}
      >
        <div class="actions flex justify-center">
          <button
            class="btn btn-block btn-md text-xl normal-case shadow-xl"
            on:click={handleStart}
            disabled={!files?.length}
          >
            Try it now
          </button>
        </div>
      </div>
    </div>
  </div>
</section>
