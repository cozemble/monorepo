<script lang="ts">
    import type {DataRecord, DataRecordValuePath, LeafModelSlot, SystemConfiguration} from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-registries'

    export let modelSlot: LeafModelSlot
    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    $: editor = slotEditorRegistry.forSlot(modelSlot)
</script>

{#if editor}
    <svelte:component
            this={editor}
            {systemConfiguration}
            {recordPath}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
