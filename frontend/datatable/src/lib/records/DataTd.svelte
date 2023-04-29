<script lang="ts">
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import {SlotView} from "@cozemble/data-paginated-editor";
    import {systemConfiguration} from "../stores/systemConfiguration";

    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot

</script>

<td data-cell-index="{rowIndex}-{colIndex}" class="border border-base-300">
    <SlotView systemConfiguration={$systemConfiguration} {record} {modelSlot}/>
</td>
