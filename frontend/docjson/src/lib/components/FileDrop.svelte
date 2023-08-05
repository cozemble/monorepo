<script lang="ts">
  import Icon from '@iconify/svelte'

  export let files: FileList | null = null

  // <!-- TODO handle file drop
  const handleFileDrop = (event: DragEvent) => {
    event.preventDefault()
    event.stopPropagation()

    files = event.dataTransfer?.files
  }

  $: if (files) console.log(files)
</script>

<div
  class="card card-bordered shadow-lg bg-base-200 border-dashed border-4 border-accent hover:border-accent-focus p-4 transition-all duration-200 ease-in-out "
>
  <label
    for="file-input"
    class="inline cursor-pointer"
    on:drag={handleFileDrop}
    on:drop={handleFileDrop}
    on:dragover={handleFileDrop}
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
