<script lang="ts">
  import { goto } from '$app/navigation'
  import FileDrop from '$lib/components/FileDrop.svelte'

  let files: File[]

  let buttonLoading = false

  function handleStart() {
    if (!files) return console.log('No files selected')

    buttonLoading = true

    handleOCR(files).then((res) => {
      console.log(res)
    })

    // <!-- ! for demo purposes -->
    setTimeout(() => {
      goto('/create')
    }, 2000)

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

<div
  class={`card shadow-2xl p-8 gap-8 w-full flex-shrink-0
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
        class="btn btn-block btn-md btn-neutral text-xl normal-case shadow-xl"
        on:click={handleStart}
        disabled={!files?.length}
      >
        {#if buttonLoading}
          <span class="loading loading-md loading-spinner" />
        {:else}
          Try it!
        {/if}
      </button>
    </div>
  </div>
</div>
