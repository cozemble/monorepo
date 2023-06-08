<script lang="ts">
    import type {
        DataRecord,
        DataRecordPathParentElement,
        LeafModelSlot,
        SystemConfiguration
    } from '@cozemble/model-core'
    import {slotViewerRegistry} from '@cozemble/model-assembled'
    import ClassicSlotView from "./ClassicSlotView.svelte";
    import SimplerSlotView from "./SimplerSlotView.svelte";

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    export let parentPath: DataRecordPathParentElement[]

    $: contract = slotViewerRegistry.contractForSlot(modelSlot)
</script>

{#if contract === 'default'}
    <ClassicSlotView {modelSlot} {record} {systemConfiguration} {parentPath}/>
{:else}
    <SimplerSlotView {modelSlot} {record} {systemConfiguration} {parentPath}/>
{/if}
