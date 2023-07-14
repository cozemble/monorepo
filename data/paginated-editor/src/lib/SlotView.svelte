<script lang="ts">
    import type {DataRecord, LeafModelSlot} from '@cozemble/model-core'
    import {slotViewerRegistry} from '@cozemble/model-registries'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {SystemConfiguration} from "@cozemble/model-core";
    import type {DataRecordPathParentElement} from "@cozemble/model-core";

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration:SystemConfiguration
    export let parentPath: DataRecordPathParentElement[]

    $: viewer = slotViewerRegistry.forSlot(modelSlot)

</script>

{#if viewer}
    <svelte:component
            this={viewer}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)}
            {systemConfiguration}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
