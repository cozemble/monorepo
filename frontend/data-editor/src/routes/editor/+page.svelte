<script lang="ts">
import { model } from '$lib/stores/models'
import { currentRecord } from '$lib/stores/records'
import { addRecord, updateRecord } from '$lib/common/actions'
import { errors } from '$lib/stores/errors'
import { recordLog, takeBack } from '$lib/stores/recordLog'

import ObjectEditorWrapper from '$lib/components/inputWrappers/ObjectEditorWrapper.svelte'
import LoadingButton from '$lib/components/LoadingButton.svelte'
import { onMount } from 'svelte'

$: console.log('log', $recordLog)
$: console.log('current', $currentRecord)

onMount(() => {
  // take back on ctrl + z
  document.addEventListener('keydown', (e) => {
    // for windows
    if (e.ctrlKey && e.key === 'z') {
      e.preventDefault()
      takeBack()
    }
    // for mac
    if (e.metaKey && e.key === 'z') {
      e.preventDefault()
      takeBack()
    }
  })
})
</script>

{#if $model?.properties}
  <div class="container">
    <ObjectEditorWrapper
      schema={$model}
      title={$model.title || 'Model'}
      bind:value={$currentRecord}
      errors={$errors}
    />

    <LoadingButton action={() => updateRecord($currentRecord)}
      >Save</LoadingButton
    >
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-4xl text-gray-500">No model selected</h1>
  </div>
{/if}
