<script lang="ts">
    import type {DataRecord, DataRecordPathElement, Property,} from '@cozemble/model-core'
    import {slotEditorRegistry} from '@cozemble/model-assembled'
    import {dataRecordPathFns} from '@cozemble/model-api'

    export let property: Property
    export let parentPath: DataRecordPathElement[]
    export let record: DataRecord

    $: editor = slotEditorRegistry.get(property.propertyType)
</script>

{#if editor}
    <svelte:component
            this={editor}
            recordPath={dataRecordPathFns.newInstance(property, ...parentPath)}
            {record}/>
{:else}
    <div>Unknown slot type: {property.propertyType.value}</div>
{/if}
