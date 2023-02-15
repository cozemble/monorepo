<script lang="ts">
import { selectedModel } from '$lib/stores/models'
import { currentRecord, addRecord } from '$lib/stores/records'
import { errors } from '$lib/stores/errors'

import ObjectEditor from '$lib/components/ObjectEditor.svelte'

$: console.info('selectedModel: ', $selectedModel)
$: console.info('current record: ', currentRecord)
</script>

{#if $selectedModel?.properties}
  <div class="container">
    <ObjectEditor
      properties={$selectedModel.properties}
      title={$selectedModel.title || 'Model'}
      bind:value={$currentRecord}
      errors={$errors}
    />
    <button
      class="btn btn-secondary self-end"
      on:click={() => addRecord($currentRecord)}>Save Record</button
    >
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-4xl text-gray-500">No model selected</h1>
  </div>
{/if}
