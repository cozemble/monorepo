<script lang="ts">
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import {slotViewerRegistry} from '@cozemble/model-assembled'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration:SystemConfiguration

    $: viewer = slotViewerRegistry.forSlot(modelSlot)

</script>

{#if viewer}
    <svelte:component
            this={viewer}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot)}
            {systemConfiguration}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
