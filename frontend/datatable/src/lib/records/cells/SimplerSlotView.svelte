<script lang="ts">
    import type {
        DataRecord,
        DataRecordPathParentElement,
        LeafModelSlot,
        Property,
        SystemConfiguration
    } from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import {slotViewerRegistry} from '@cozemble/model-assembled'

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    export let parentPath: DataRecordPathParentElement[]
    const property = modelSlot as Property

    const propertyDescriptor = propertyDescriptors.mandatory(property)

    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    $: viewer = slotViewerRegistry.forSlot(modelSlot)

</script>

{#if viewer}
    <svelte:component
            this={viewer}
            {value}
            {property}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
