<script lang="ts">
import type { DataRecord, Model } from '@cozemble/model-core'
import type { CellFocus } from '$lib/CellFocus'
import { writable, type Writable } from 'svelte/store'
import DataTd from '$lib/DataTd.svelte'
import StackingRecordEditor from './StackingRecordEditor.svelte'
import { RecordEditContext, type RecordSaveOutcome } from './RecordEditContext'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import type { PaginatedEditorHost } from '$lib/PaginatedEditorHost'

export let models: Model[]
export let model: Model
export let records: DataRecord[]
export let paginatedEditorHost: PaginatedEditorHost

let focus: Writable<CellFocus | null> = writable(null)
let doAddNewRecord = false
let recordBeingEdited: DataRecord | null = null
let modelLevelErrors: string[] = []

function deleteRecord(_record: DataRecord) {}

function editRecord(record: DataRecord) {
  recordBeingEdited = record
}

function beginAddNewRecord() {
  doAddNewRecord = true
}

async function recordEdited(
  editedRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  const outcome = await paginatedEditorHost.recordEdited(editedRecord)
  if (outcome._type === 'record.save.succeeded') {
    recordBeingEdited = null
  }
  return outcome
}

async function saveNewRecord(
  newRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  modelLevelErrors = []
  const outcome = await paginatedEditorHost.saveNewRecord(newRecord)
  if (outcome._type === 'record.save.succeeded') {
    doAddNewRecord = false
  } else {
    modelLevelErrors = outcome.errors
  }
  return outcome
}
</script>

{#each modelLevelErrors as error}
  <div class="error" role="alert">
    {error}
  </div>
{/each}
{#if doAddNewRecord}
  <StackingRecordEditor
    recordEditContext={new RecordEditContext(
      models,
      eventSourcedDataRecordFns.newInstance(models, model.id, 'test-user'),
      saveNewRecord,
      () => (doAddNewRecord = false),
      `Add new ${model.name.value}`,
    )}
  />
{:else if recordBeingEdited !== null}
  <StackingRecordEditor
    recordEditContext={new RecordEditContext(
      models,
      eventSourcedDataRecordFns.fromRecord(models, recordBeingEdited),
      recordEdited,
      () => (recordBeingEdited = null),
      `Edit ${model.name.value}`,
    )}
  />
{:else}
  <table class="table">
    <thead>
      <tr>
        {#each model.properties as property}
          <th class="data-cell">{property.name.value}</th>
        {/each}
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      {#each records as record, rowIndex}
        <tr data-row-index={rowIndex}>
          {#each model.properties as property, colIndex}
            <DataTd {focus} {rowIndex} {colIndex} {record} {property} />
          {/each}
          <td>
            <button
              class="edit btn btn-warning"
              on:click={() => editRecord(record)}>Edit</button
            >
            <button
              class="delete btn btn-error"
              on:click={() => deleteRecord(record)}>Delete</button
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
  <div class="actions">
    <button type="button" class="add-record btn" on:click={beginAddNewRecord}
      >Add {model.name.value}</button
    >
  </div>
{/if}
