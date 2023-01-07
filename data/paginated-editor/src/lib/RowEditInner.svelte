<script lang="ts">
import type { DataRecord, Model } from '@cozemble/model-core'
import type { CellFocus } from '$lib/CellFocus'
import type { Writable } from 'svelte/store'
import DataTd from '$lib/DataTd.svelte'
import { modelFns } from '@cozemble/model-api'
import { applyValueChangedToRecord } from '$lib/onValueChanged'
import type {
  DataRecordEditEvent,
  DataRecordEditorClient,
} from '@cozemble/model-editor-sdk'
import { dataRecordEditorHost } from '@cozemble/model-editor-sdk'
import { createEventDispatcher } from 'svelte'

export let model: Model
export let focus: Writable<CellFocus | null>
export let rowIndex: number
export let record: DataRecord
const dispatch = createEventDispatcher()
let showErrors = false

function saveRecord() {
  const errors = modelFns.validate(model, record)
  console.log({ errors })
  if (errors.size > 0) {
    showErrors = true
  }
}

function cancel() {
  dispatch('cancel')
}

const dataRecordEditorClient: DataRecordEditorClient = {
  dispatchEditEvent(event: DataRecordEditEvent): void {
    console.log({ event })
    if (event._type === 'data.record.value.changed') {
      record = applyValueChangedToRecord(record, event)
    }
    if (event._type === 'data.record.edit.aborted') {
      dispatch('escape')
    }
  },
}
dataRecordEditorHost.setClient(dataRecordEditorClient)
</script>

<tr>
  {#each model.properties as property, colIndex}
    <DataTd {focus} {rowIndex} {colIndex} {record} {property} {showErrors} />
  {/each}
  <td>
    <button type="button" class="save" on:click={saveRecord}>Save</button>
    <button type="button" class="cancel" on:click={cancel}>Cancel</button>
  </td>
</tr>

<style>
td {
  border: 1px solid black;
  padding: 0.5rem;
}
</style>
