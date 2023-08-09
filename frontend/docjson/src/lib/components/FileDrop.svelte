<script lang="ts">
  import Icon from '@iconify/svelte'

  export let files: FileList | null = null

  const handleFileDrop = (event: DragEvent) => {
    const inputVal = event.dataTransfer?.files

    if (!inputVal) return

    files = inputVal
  }

  // Highlight state
  let highlightState = false

  const handleDragEnter = (event: DragEvent) => {
    highlightState = true
  }
  const handleDragLeave = (event: DragEvent) => {
    highlightState = false
  }

  $: if (files) highlightState = true
  //

  $: if (files) console.log(files)
</script>

<div
  class={`card card-bordered shadow-lg bg-base-200 
  border-dashed border-4 border-accent hover:border-accent-focus 
  p-4 transition-all duration-200 ease-in-out
  ${highlightState && 'border-accent-focus bg-base-300'}`}
>
  <label
    for="file-input"
    class="inline cursor-pointer"
    on:dragenter|preventDefault={handleDragEnter}
    on:dragover|preventDefault={handleDragEnter}
    on:dragleave|preventDefault={handleDragLeave}
    on:drop|preventDefault|stopPropagation={handleFileDrop}
  >
    <figure class="pt-10">
      <!-- TODO determine what illustration/icon to use -->
      <Icon icon="ic:round-upload-file" class="text-9xl text-neutral" />
      <!-- <Icon icon="system-uicons:document-stack" class="text-9xl text-neutral" /> -->
      <!-- <Icon icon="heroicons:document-text-solid" class="text-9xl text-neutral" /> -->
      <!-- <Icon icon="fxemoji:documenttextpicture" class="text-9xl " /> -->
    </figure>

    <!-- TODO display dropped file name and preview -->

    <div class="card-body">
      <h5 class="card-title whitespace-nowrap text-center">Drop a file here</h5>
      <p class="card-text whitespace-nowrap text-center">Or click to select a file</p>
    </div>

    <!-- TODO action -->
    <!-- <div class="card-actions justify-end">
      <button class="btn btn-primary">Proceed</button>
    </div> -->
  </label>

  <input type="file" bind:files id="file-input" class="hidden" />
</div>
