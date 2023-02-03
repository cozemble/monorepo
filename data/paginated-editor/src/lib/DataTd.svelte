<script lang="ts">
import PropertyView from './PropertyView.svelte'
import { type CellFocus, isFocussedCell } from './CellFocus'
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
