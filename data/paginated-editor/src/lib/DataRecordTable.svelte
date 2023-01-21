<script lang="ts">
import type { DataRecordPathFocus } from './DataRecordPathFocus'
import type {
  DataRecord,
  DataRecordPath,
  DataRecordPathElement,
  Model,
} from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { dataRecordTableClicked } from './dataRecordTableClicked'
import DataRecordTableTd from '$lib/DataRecordTableTd.svelte'

export let model: Model
export let record: DataRecord
export let parentPath: DataRecordPathElement[]
export let errors: Map<DataRecordPath, string[]>
export let focus: Writable<DataRecordPathFocus>
export let showErrors: boolean
</script>

<table on:click={(event) => dataRecordTableClicked(focus, event)}>
  <thead>
    <tr>
      {#each model.properties as property}
        <th>{property.name.value}</th>
      {/each}
    </tr>
  </thead>
  <tbody>
    <tr>
      {#each model.properties as property}
        <DataRecordTableTd
          {property}
          {record}
          {parentPath}
          {errors}
          {focus}
          {showErrors}
        />
      {/each}
    </tr></tbody
  >
</table>

<style>
table {
  border-collapse: collapse;
}

th {
  border: 1px solid black;
  padding: 0.5rem;
}
</style>
