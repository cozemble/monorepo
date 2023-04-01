<script lang="ts">
    import type {DataRecord, Property} from '@cozemble/model-core'
    import {slotViewerRegistry} from '@cozemble/model-assembled'
    import {dataRecordValuePathFns} from '@cozemble/model-api'

    export let property: Property
    export let record: DataRecord

    $: viewer = slotViewerRegistry.get(property.propertyType)
</script>

{#if viewer}
    <svelte:component
            this={viewer}
            recordPath={dataRecordValuePathFns.newInstance(property)}
            {record}/>
{:else}
    <div>Unknown slot type: {property.propertyType.value}</div>
{/if}
