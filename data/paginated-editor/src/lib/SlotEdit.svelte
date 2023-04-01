<script lang="ts">
    import type {DataRecord, DataRecordPathParentElement, Property,} from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-assembled'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let property: Property
    export let parentPath: DataRecordPathParentElement[]
    export let record: DataRecord

    $: editor = slotEditorRegistry.get(property.propertyType)
</script>

{#if editor}
    <svelte:component
            this={editor}
            recordPath={dataRecordValuePathFns.newInstance(property, ...parentPath)}
            {record}/>
{:else}
    <div>Unknown slot type: {property.propertyType.value}</div>
{/if}
