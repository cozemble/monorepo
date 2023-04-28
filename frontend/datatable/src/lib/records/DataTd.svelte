<script lang="ts">
    import type {DataRecord, LeafModelSlot, SystemConfiguration} from '@cozemble/model-core'
    import {SlotView} from "@cozemble/data-paginated-editor";

    export let rowIndex: number
    export let colIndex: number
    export let record: DataRecord
    export let modelSlot: LeafModelSlot
    export let systemConfiguration: SystemConfiguration

</script>

<td data-cell-index="{rowIndex}-{colIndex}" class="border border-base-300">
    <SlotView {systemConfiguration} {record} {modelSlot}/>
</td>
