<script lang="ts">
import type {
  DataRecord,
  DataRecordId,
  DataRecordPathParentElement,
  ModelSlot,
} from '@cozemble/model-core'

import { tick } from 'svelte'
import { writable } from 'svelte/store'

// Cozemble
import { propertyDescriptors, propertyNameFns } from '@cozemble/model-core'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk/dist/esm'
import { mandatory } from '@cozemble/lang-util/dist/esm'

// stores
import { allEventSourcedModels } from '$lib/stores/allModels'
import { systemConfiguration } from '$lib/stores/systemConfiguration'
import { contextHelper } from '$lib/stores/contextHelper'
import * as modelsStore_r from '$lib/stores/models'
// records
import type { SlotBeingEdited } from '$lib/records/helpers'
import type { DataRecordsTableOptions } from '$lib/records/DataRecordsTableOptions'
import { dataRecordsTableOptions } from '$lib/records/DataRecordsTableOptions'
import { modelRecordsContextFns } from '$lib/records/modelRecordsContextFns'
// components
import DataEntryRow from '$lib/records/entry/DataEntryRow.svelte'
import AddModelElementButton from '$lib/records/modelling/AddModelElementButton.svelte'
import SlotTh from '$lib/records/SlotTh.svelte'
import SlotEditModal from '$lib/records/SlotEditModal.svelte'

export let oneOnly = false
export let options: DataRecordsTableOptions = dataRecordsTableOptions(
  true,
  true,
  true,
)
export let expandedRecordIds = writable([] as DataRecordId[])
export let parentPath: DataRecordPathParentElement[] = []

// context
const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
const model = modelRecordsContextFns.getModel()
const eventSourcedRecords = modelRecordsContextFns.getEventSourcedRecords()
const records = modelRecordsContextFns.getRecords()
const focus = modelRecordsContextFns.getFocus()
const focusControls = modelRecordsContextFns.getFocusControls()
const recordControls = modelRecordsContextFns.getRecordControls()
const modelControls = modelRecordsContextFns.getModelControls()
const dirtyRecords = modelRecordsContextFns.getDirtyRecords()
const nestedModelBeingEdited =
  modelRecordsContextFns.getNestedModelBeingEdited()
const permitModelling = contextHelper.getPermitModelling()
const permitRecordAdditions = modelRecordsContextFns.getPermitRecordAdditions()

let slotBeingEdited: SlotBeingEdited | null = null

const { model: model_r } = modelsStore_r.contexts.getAll()

//

function editSlot(clicked: Event, slot: ModelSlot) {
  const anchorElement = (clicked.target as HTMLElement).closest('th')
  if (!anchorElement) {
    return
  }
  slotBeingEdited = {
    models: $allEventSourcedModels,
    model: $eventSourcedModel,
    slot,
    anchorElement,
  }
}

async function addInnerTable() {
  const nestedModelId = await modelControls.addNestedModel(
    $eventSourcedModel,
    modelFns.newInstance(
      'Inner table',
      modelOptions.withSlot(propertyFns.newInstance('Field 1')),
    ),
    'many',
  )
  await tick()
  expandLastRow()
  nestedModelBeingEdited.set(nestedModelId)
}

async function addInnerRecord() {
  const nestedModelId = await modelControls.addNestedModel(
    $eventSourcedModel,
    modelFns.newInstance(
      'Inner record',
      modelOptions.withSlot(propertyFns.newInstance('Field 1')),
    ),
    'one',
  )
  await tick()
  expandLastRow()
  nestedModelBeingEdited.set(nestedModelId)
}

async function addSlotToModel() {
  await modelsStore_r.addSlotToModel(model_r)

  await tick()
  const element = document.querySelector(
    `th#field-${$model.slots.length}`,
  ) as HTMLElement
  if (element) {
    const slot = $model.slots[$model.slots.length - 1]
    slotBeingEdited = {
      models: $allEventSourcedModels,
      model: $eventSourcedModel,
      slot,
      anchorElement: element,
    }
  }
}

async function modelEdited(event: CustomEvent) {
  const edited = event.detail.model
  await modelControls.modelEdited(edited)
  slotBeingEdited = null
}

function expandRecord(id: DataRecordId) {
  expandedRecordIds.update((ids: DataRecordId[]) => [...ids, id])
}

function collapseRecord(id: DataRecordId) {
  expandedRecordIds.update((ids: DataRecordId[]) =>
    ids.filter((x) => x.value !== id.value),
  )
}

function flashRow(rowIndex: number) {
  const row = document.querySelector(
    `tr[data-row-index="${rowIndex}"]`,
  ) as HTMLElement
  const extraClasses = ['border', 'border-primary', 'border-4']
  if (row) {
    for (const extraClass of extraClasses) {
      row.classList.add(extraClass)
    }
    setTimeout(() => {
      for (const extraClass of extraClasses) {
        row.classList.remove(extraClass)
      }
    }, 1000)
  }
}

function expandLastRow() {
  expandRecord($records[$records.length - 1].id)
}

async function saveNewRecord(record: DataRecord, rootRecordIndex: number) {
  const isExpanded = $expandedRecordIds.find((x) => x.value === record.id.value)
  const outcome = await recordControls.saveNewRecord(record.id)
  if (outcome) {
    expandRecord(record.id)
  } else {
    collapseRecord(record.id)
    focusControls.ensureNotFocusedOnRow(rootRecordIndex)
    flashRow($records.length - 2)
    if (isExpanded) {
      expandLastRow()
    }
  }
}

function recordHasEvents(rowIndex: number, records: EventSourcedDataRecord[]) {
  return (
    mandatory(records[rowIndex], `No event sourced record at index ${rowIndex}`)
      .events.length > 0
  )
}

function isDirtyRecord(record: DataRecord, dirtyRecords: DataRecordId[]) {
  return dirtyRecords.some((x) => x.value === record.id.value)
}

function onSaveExistingRecord(recordId: DataRecordId) {
  recordControls.saveRecord(recordId)
}

$: hasModellingColumn = options.permitModelEditing && $permitModelling
$: colspan =
  $model.slots.length +
  (hasModellingColumn ? 1 : 0) +
  (options.showActions ? 1 : 0)
</script>

<table class="table table-compact">
  <thead>
    <tr>
      {#each $model.slots as slot, index}
        <SlotTh
          {slot}
          {index}
          {editSlot}
          permitModelEditing={options.permitModelEditing}
        />
      {/each}

      {#if hasModellingColumn}
        <td class="bg-base-300 px-8">
          <div class="flex items-center">
            <AddModelElementButton
              {addSlotToModel}
              {addInnerTable}
              {addInnerRecord}
            />
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
            {#if $records.length > 1}
              <tr class="bg-accent">
                <td {colspan} class="bg-base-300 w-full text-xs">
                  <div>Add next record below</div>
                </td>
              </tr>
            {/if}

            <DataEntryRow
              {parentPath}
              {options}
              {record}
              {rowIndex}
              oneOnly={true}
              {expandedRecordIds}
            />

            {#if recordHasEvents(rowIndex, $eventSourcedRecords)}
              <tr>
                <td {colspan}>
                  <div class="flex justify-center">
                    <button
                      class="btn btn-primary save-root-record"
                      on:click={() =>
                        saveNewRecord(record, $records.length - 1)}
                    >
                      Save {$model.name.value}</button
                    >
                    <button class="btn btn-secondary ml-2">Clear</button>
                  </div>
                </td>
              </tr>
            {/if}
          {/if}
        {:else}
          <DataEntryRow
            {parentPath}
            {options}
            {record}
            {rowIndex}
            {oneOnly}
            {expandedRecordIds}
          />

          {#if isDirtyRecord(record, $dirtyRecords) && parentPath.length === 0}
            <tr>
              <td {colspan}>
                <div class="flex justify-center">
                  <button
                    class="btn btn-primary save-root-record"
                    on:click={() => onSaveExistingRecord(record.id)}
                  >
                    Save {$model.name.value}</button
                  >
                  <button
                    class="btn btn-secondary ml-2"
                    on:click={() => alert('to do')}>Cancel</button
                  >
                </div>
              </td>
            </tr>
          {/if}
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
