<script lang="ts">
    import type {DataRecord, Property} from '@cozemble/model-core'
    import {propertyViewerRegistry} from '@cozemble/model-assembled'
    import {dataRecordPathFns} from '@cozemble/model-api'

    export let property: Property
    export let record: DataRecord

    $: viewer = propertyViewerRegistry.get(property.propertyType)
</script>

{#if viewer}
    <svelte:component
            this={viewer}
            recordPath={dataRecordPathFns.newInstance(property)}
            {record}
    />
{:else}
    <div>Unknown property type: {property.propertyType.value}</div>
{/if}
