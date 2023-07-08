<script lang="ts">
    import type {DataRecord, DataRecordPathParentElement, LeafModelSlot} from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-registries'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let modelSlot: LeafModelSlot
    export let parentPath: DataRecordPathParentElement[]
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    $: editor = slotEditorRegistry.forSlot(modelSlot)
</script>

{#if editor}
    <svelte:component
            this={editor}
            {systemConfiguration}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
