<script lang="ts">
  import { writable } from 'svelte/store'

  // Cozemble
  import type { DataRecordId, DataRecordPathParentElement, ModelSlot } from '@cozemble/model-core'

  // stores
  import { allEventSourcedModels } from '$lib/stores/allModels'
  import { contextHelper } from '$lib/stores/contextHelper'
  import * as modelsStore_r from '$lib/stores/models'
  // records
  import type { SlotBeingEdited } from '$lib/records/helpers'
  import type { DataRecordsTableOptions } from '$lib/records/DataRecordsTableOptions'
  import { dataRecordsTableOptions } from '$lib/records/DataRecordsTableOptions'
  // components
  import DataEntryRow from '$lib/records/entry/DataEntryRow_r.svelte'
  import AddModelElementButton from './AddModelElementButton.svelte'
  import SlotEditModal from '$lib/records/SlotEditModal.svelte'
  import SlotTh from '$lib/records/cells/SlotTh.svelte'
  import RecordAdditionRow from '$lib/records/RecordAdditionRow.svelte'
  import RecordSaveButton from '$lib/records/RecordSaveButton.svelte'

  export let oneOnly = false
  export let options: DataRecordsTableOptions = dataRecordsTableOptions(true, true, true)
  export let expandedRecordIds = writable([] as DataRecordId[])
  export let parentPath: DataRecordPathParentElement[] = []

  // context
  const permitModelling = contextHelper.getPermitModelling()

  let slotBeingEdited: SlotBeingEdited | null = null

  const { model, eventSourcedModel, records, permitRecordAdditions } =
    modelsStore_r.contexts.getAll()

  //

  function editSlot(clicked: Event, slot: ModelSlot) {
    const anchorElement = (clicked.target as HTMLElement).closest('th')
    if (!anchorElement) {
      return
    }
    slotBeingEdited = {
      modelList: allEventSourcedModels,
      model: $eventSourcedModel,
      slot,
      anchorElement,
    }
  }

  async function modelEdited() {
    slotBeingEdited = null
  }

  function editNewSlot(event: CustomEvent) {
    slotBeingEdited = event.detail.slotBeingEdited
  }

  $: hasModellingColumn = options.permitModelEditing && $permitModelling
  $: colspan = $model.slots.length + (hasModellingColumn ? 1 : 0) + (options.showActions ? 1 : 0)
</script>

<table class="table table-compact">
  <thead>
    <tr>
      {#each $model.slots as slot, index}
        <SlotTh {slot} {index} {editSlot} permitModelEditing={options.permitModelEditing} />
      {/each}
      {#if hasModellingColumn}
        <td class="bg-base-300 px-8">
          <div class="flex items-center">
            <AddModelElementButton {expandedRecordIds} on:editSlot={editNewSlot} />
          </div>
        </td>
      {/if}
      {#if options.showActions}
        <td class="bg-base-300">Actions</td>
      {/if}
    </tr>
  </thead>
  <tbody>
    {#each $records as record, rowIndex}
      {#key record.id.value}
        {#if rowIndex === $records.length - 1 && parentPath.length === 0}
          {#if $permitRecordAdditions}
            <RecordAdditionRow
              {colspan}
              {parentPath}
              {options}
              {rowIndex}
              {expandedRecordIds}
              {record}
            />
          {/if}
        {:else}
          <DataEntryRow {parentPath} {options} {record} {rowIndex} {oneOnly} {expandedRecordIds} />
          <RecordSaveButton {record} {parentPath} {colspan} />
        {/if}
      {/key}
    {/each}
  </tbody>
</table>

{#if slotBeingEdited}
  <SlotEditModal
    {slotBeingEdited}
    on:close={() => (slotBeingEdited = null)}
    on:edited={modelEdited}
  />
{/if}
