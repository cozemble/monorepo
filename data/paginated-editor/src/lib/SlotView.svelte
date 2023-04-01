<script lang="ts">
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import {slotViewerRegistry} from '@cozemble/model-assembled'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let modelSlot: LeafModelSlot
    export let record: DataRecord

    $: viewer = slotViewerRegistry.forSlot(modelSlot)

</script>

{#if viewer}
    <svelte:component
            this={viewer}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot)}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
