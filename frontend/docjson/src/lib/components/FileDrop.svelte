<!-- @component 
  Dropzone for files
  @param {File[]} files - List of files
-->
<script lang="ts">
  import _ from 'lodash'
  import Icon from '@iconify/svelte'

  // <!-- TODO refactor readability -->

  /** The actual value array */
  export let files: File[] = []
  /** To use with the HTML input */
  let fileList: FileList | null = null

  // utils
  const arrayToFileList = (array: File[]) => {
    let newList = new DataTransfer()
    array.forEach((file) => newList.items.add(file))

    return newList.files
  }

  const handleDuplicates = (files: File[]) => _.uniqBy(files, 'name')
  const sortFiles = (files: File[]) => _.sortBy(files, 'name')
  const formatFiles = (files: File[]) => sortFiles(handleDuplicates(files))

  const handleFileDrop = (event: DragEvent) => {
    const inputVal = event.dataTransfer?.files

    if (!inputVal) return

    // combine the previous files with the new files
    files = formatFiles([...Array.from(fileList || []), ...Array.from(inputVal)])
    fileList = arrayToFileList(files)
  }

  // Map FileList to File[]
  const handleFileInput = (fList: FileList) => {
    files = formatFiles([...files, ...Array.from(fList || [])])
  }

  $: if (fileList) handleFileInput(fileList)

  const handleFileRemove = (fileName: string) => {
    if (!files) return

    files = files?.filter((file) => file.name !== fileName)

    fileList = arrayToFileList(files)
  }

  // Highlight state
  let highlightState = false

  const handleDragEnter = (event: DragEvent) => {
    highlightState = true
  }
  const handleDragLeave = (event: DragEvent) => {
    highlightState = false
  }

  $: highlightState = !!files?.length
  //
</script>

<div
  class={`card card-bordered shadow-lg bg-base-200 w-[24rem]
  p-4 transition-all duration-200 ease-in-out
  ${highlightState && 'bg-base-300'}`}
>
  <label
    for="file-input"
    class="inline cursor-pointer"
    on:dragenter|preventDefault={handleDragEnter}
    on:dragover|preventDefault={handleDragEnter}
    on:dragleave|preventDefault={handleDragLeave}
    on:drop|preventDefault|stopPropagation={handleFileDrop}
  >
    <div class="card-body">
      <figure class=" w-50 relative">
        <!-- TODO determine what illustration/icon to use -->
        <Icon icon="ic:round-upload-file" class="text-9xl text-neutral" />
        <!-- <Icon icon="system-uicons:document-stack" class="text-9xl text-neutral" /> -->
        <!-- <Icon icon="heroicons:document-text-solid" class="text-9xl text-neutral" /> -->
        <!-- <Icon icon="fxemoji:documenttextpicture" class="text-9xl " /> -->
      </figure>

      <h5 class="card-title whitespace-nowrap text-center block">Drop a file here</h5>
      <p class="card-text whitespace-nowrap text-center">Or click to select a file</p>
    </div>

    <!-- Display files -->
    <!-- TODO max-height and scrollbar -->
    <div class="flex flex-col gap-1">
      {#if files.length}
        <!-- TODO make all files the same height -->
        {#each files as file}
          <div
            title={file.name}
            class="badge badge-outline flex flex-row justify-between w-full flex-1 gap-2 overflow-hidden"
          >
            <figure class="h-7 w-11 rounded-none ">
              {#if ['.jpg', '.png', '.webp', '.jpeg'].some((ext) => _.endsWith(file.name, ext))}
                <img src={URL.createObjectURL(file)} alt={file.name} class="h-full" />
              {:else}
                <Icon icon="ic:round-insert-drive-file" class="text-2xl" />
              {/if}
            </figure>

            <span
              title={file.name}
              class="text-sm whitespace-nowrap text-ellipsis min-w-0 w-full overflow-hidden"
              >{file.name}</span
            >

            <button
              class="btn btn-circle btn-xs btn-ghost"
              title="Remove file"
              on:click={() => handleFileRemove(file.name)}
            >
              <Icon icon="ep:close-bold" />
            </button>
          </div>
        {/each}
      {:else}
        <p class="text-center text-xs opacity-50 mb-5">You haven't selected any files yet</p>
      {/if}
    </div>
  </label>

  <input type="file" bind:files={fileList} id="file-input" class="hidden" multiple />
</div>
