<!-- @component 
  Dropzone for files
  @param {File[]} files - List of files
-->
<script lang="ts">
  import _ from 'lodash'
  import Icon from '@iconify/svelte'

  /** The actual value array */
  export let files: File[] = []

  /** To use with the HTML input */
  let fileList: FileList | null = null

  /** Highlight the dropzone when files are present */
  let highlightState = false

  // Functions

  function arrayToFileList(array: File[]) {
    let newList = new DataTransfer()
    array.forEach((file) => newList.items.add(file))

    return newList.files
  }

  /** Removes duplicates and sorts by name */
  function addFiles(fList: FileList) {
    const newFiles = Array.from(fList || [])

    const mergedFiles = _.uniqBy([...files, ...newFiles], 'name')
    const sortedFiles = _.sortBy(mergedFiles, 'name')

    files = sortedFiles
    fileList = arrayToFileList(sortedFiles) // update input value
  }

  function removeFile(fileName: string) {
    files = files?.filter((file) => file.name !== fileName)
    fileList = arrayToFileList(files) // update input value
  }

  // Event handlers

  function handleFileDrop(event: DragEvent) {
    const inputVal = event.dataTransfer?.files

    if (!inputVal) return

    addFiles(inputVal)
  }

  const handleDragEnter = (event: DragEvent) => (highlightState = true)
  const handleDragLeave = (event: DragEvent) => (highlightState = false)

  // Watchers

  $: if (fileList) addFiles(fileList) // add files from input
  $: highlightState = !!files?.length // highlight when files are present
  //
</script>

<div
  class={`card card-bordered p-4 w-full shadow-lg bg-base-100 hover:bg-base-200
          transition-all duration-200 ease-in-out
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
        <Icon icon="ic:round-upload-file" class="text-9xl text-neutral" />
      </figure>

      <h5 class="card-title whitespace-nowrap text-center block">Drop a file here</h5>
      <p class="card-text whitespace-nowrap text-center">Or click to select a file</p>
    </div>

    <!-- Display files if there are, else display a message -->
    <div class="flex flex-col gap-1">
      <!--  -->
      <!-- TODO max-height and scrollbar -->

      {#if files.length}
        {#each files as file}
          <div
            title={file.name}
            class="badge badge-outline flex flex-row justify-between w-full flex-1 gap-2 overflow-hidden"
          >
            <!-- Display preview or icon  -->
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
              on:click={() => removeFile(file.name)}
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
