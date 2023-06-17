<script lang="ts">
    import type {
        DataRecord,
        DataRecordPathParentElement,
        LeafModelSlot,
        SystemConfiguration
    } from '@cozemble/model-core'
    import ClassicSlotView from "./ClassicSlotView.svelte";
    import SimplerSlotView from "./SimplerSlotView.svelte";

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    export let parentPath: DataRecordPathParentElement[]

</script>

{#if modelSlot._type === 'property'}
    <SimplerSlotView {modelSlot} {record} {systemConfiguration} {parentPath}/>
{:else}
    <ClassicSlotView {modelSlot} {record} {systemConfiguration} {parentPath}/>
{/if}
