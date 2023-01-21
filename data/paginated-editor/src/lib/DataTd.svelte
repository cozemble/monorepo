<script lang="ts">
import PropertyView from '$lib/PropertyView.svelte'
import { type CellFocus, isFocussedCell } from '$lib/CellFocus'
import type { DataRecord, Property } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'

export let focus: Writable<CellFocus | null>
export let rowIndex: number
export let colIndex: number
export let record: DataRecord
export let property: Property
</script>

<td
  class:highlighted={isFocussedCell($focus, rowIndex, colIndex)}
  data-cell-index="{rowIndex}-{colIndex}"
>
  <PropertyView {record} {property} />
</td>

<style>
.highlighted {
  border-color: blue;
  border-width: 2px;
}

td {
  border: 1px solid black;
  padding: 0.5rem;
}
</style>
