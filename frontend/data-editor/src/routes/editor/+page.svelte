<script lang="ts">
import { selectedModel } from '$lib/stores/models'
import { records, addRecord } from '$lib/stores/records'
import { initValues } from '$lib/utils'

import ObjectEditor from '$lib/components/ObjectEditor.svelte'

let record = initValues($selectedModel?.properties || {})

selectedModel.subscribe((model) => {
  record = initValues(model?.properties || {})
})

console.log('selectedModel', $selectedModel)
</script>

{#if $selectedModel?.properties}
  <div class="container">
    <ObjectEditor
      properties={$selectedModel.properties}
      title={$selectedModel.title || 'Model'}
      bind:value={record}
    />
    <button
      class="btn btn-secondary self-end"
      on:click={() => addRecord(record)}>Save Record</button
    >
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-4xl text-gray-500">No model selected</h1>
  </div>
{/if}
