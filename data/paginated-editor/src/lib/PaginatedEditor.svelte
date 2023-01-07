<script lang="ts">
import type { DataRecord, Model } from '@cozemble/model-core'
import type { CellFocus } from '$lib/CellFocus'
import { cellFocus } from '$lib/CellFocus'
import type { UiMode } from '$lib/onValueChanged'
import { writable, type Writable } from 'svelte/store'
import { dataRecordFns } from '@cozemble/model-api'
import RowEdit from '$lib/RowEdit.svelte'
import { isFocussedRow } from '$lib/CellFocus'
import DataTd from '$lib/DataTd.svelte'

export let model: Model
export let records: DataRecord[]

let mode: Writable<UiMode> = writable('navigate')
let focus: Writable<CellFocus | null> = writable(null)

function deleteRecord(_record: DataRecord) {}

function editRecord(_record: DataRecord) {}

function addRecord() {
  records = [...records, dataRecordFns.newInstance(model, 'test-user')]
  $mode = 'edit'
  setCellFocus(records.length - 1, 0)
}

function setCellFocus(row: number, column: number) {
  $focus = cellFocus(row, column)
}

function bodyClicked(event: Event) {
  const target = event.target as HTMLElement
  const cell = target.closest('td')
  if (cell) {
    const cellIndex = cell.getAttribute('data-cell-index')
    if (cellIndex) {
      const [row, column] = cellIndex.split('-').map(Number)
      setCellFocus(row, column)
    }
  }
}

function keyup(event: KeyboardEvent) {
  if ($mode === 'navigate') {
    if (event.key === 'Enter') {
      $mode = 'edit'
    }
  }
}

function cancelRowEdit() {
  $mode = 'navigate'
  focus.set(null)
}

function rowEditEscape() {
  $mode = 'navigate'
  focus.set(null)
}
</script>

<svelte:window on:keyup={keyup} />

<table>
  <thead>
    <tr>
      {#each model.properties as property}
        <th class="data-cell">{property.name}</th>
      {/each}
      <th>Actions</th>
    </tr>
  </thead>
  <tbody on:click={bodyClicked}>
    {#each records as record, rowIndex}
      {#if $mode === 'edit' && isFocussedRow($focus, rowIndex)}
        <RowEdit
          {record}
          {rowIndex}
          {model}
          {focus}
          on:cancel={cancelRowEdit}
          on:escape={rowEditEscape}
        />
      {:else}
        <tr>
          {#each model.properties as property, colIndex}
            <DataTd {focus} {rowIndex} {colIndex} {record} {property} />
          {/each}
          <td>
            <button on:click={() => editRecord(record)}>Edit</button>
            <button on:click={() => deleteRecord(record)}>Delete</button>
          </td>
        </tr>
      {/if}
    {/each}
  </tbody>
</table>
<div class="actions">
  <button type="button" class="add-record" on:click={addRecord}
    >Add record</button
  >
</div>

<style>
.data-cell {
  height: 100%;
}

.actions {
  margin-top: 20px;
}

table {
  border-collapse: collapse;
}

th,
td {
  border: 1px solid black;
  padding: 0.5rem;
}
</style>
