<script lang="ts">
import { model } from '$lib/stores/models'
import { currentRecord, addRecord } from '$lib/stores/records'
import { errors } from '$lib/stores/errors'

import ObjectEditor from '$lib/components/ObjectEditor.svelte'
import LoadingButton from '$lib/components/LoadingButton.svelte'
</script>

{#if $model?.properties}
  <div class="container">
    <ObjectEditor
      properties={$model.properties}
      title={$model.title || 'Model'}
      bind:value={$currentRecord}
      errors={$errors}
    />

    <LoadingButton action={() => addRecord($currentRecord)}>Save</LoadingButton>
  </div>
{:else}
  <div class="flex flex-col items-center justify-center h-full">
    <h1 class="text-4xl text-gray-500">No model selected</h1>
  </div>
{/if}
