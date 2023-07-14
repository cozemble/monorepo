<script lang="ts">
    import type {
        DataRecord,
        DataRecordPathParentElement,
        LeafModelSlot,
        SystemConfiguration
    } from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-registries'
    import {dataRecordValuePathFns} from '@cozemble/model-api'
    import SimplerSlotEdit from "$lib/records/cells/SimplerSlotEdit.svelte";
    import ClassicSlotEdit from "$lib/records/cells/ClassicSlotEdit.svelte";

    export let modelSlot: LeafModelSlot
    export let parentPath: DataRecordPathParentElement[]
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    $: contract = slotEditorRegistry.contractForSlot(modelSlot)

</script>

{#if contract === 'simple'}
    <SimplerSlotEdit
            {modelSlot}
            {systemConfiguration}
            recordPath={dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)}
            {record}/>
{:else}
    <ClassicSlotEdit {modelSlot} {systemConfiguration}
                     recordPath={dataRecordValuePathFns.newInstance(modelSlot, ...parentPath)} {record}/>
{/if}
