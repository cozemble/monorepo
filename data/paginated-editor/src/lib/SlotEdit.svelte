<script lang="ts">
    import type {DataRecord, DataRecordPathParentElement, LeafModelSlot} from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-assembled'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let modelSlot: LeafModelSlot
    export let parentPath: DataRecordPathParentElement[]
    export let record: DataRecord

    $: editor = slotEditorRegistry.forSlot(modelSlot)
</script>

{#if editor}
    <svelte:component
            this={editor}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)}
            {record}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
