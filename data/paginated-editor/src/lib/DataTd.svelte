<script lang="ts">
    import SlotView from './SlotView.svelte'
    import {type CellFocus, isFocussedCell} from './CellFocus'
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import type {Writable} from 'svelte/store'

    export let focus: Writable<CellFocus | null>
    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot
</script>

<td class:highlighted={isFocussedCell($focus, rowIndex, colIndex)} data-cell-index="{rowIndex}-{colIndex}">
    <SlotView {record} {modelSlot}/>
</td>
