<script lang="ts">
    import type {
        DataRecord,
        DataRecordPathParentElement,
        LeafModelSlot,
        Property,
        SystemConfiguration
    } from '@cozemble/model-core'
    import {propertyDescriptors} from "@cozemble/model-core";
    import {slotViewerRegistry} from '@cozemble/model-registries'
    import {afterUpdate} from 'svelte'

    export let modelSlot: LeafModelSlot
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration
    export let parentPath: DataRecordPathParentElement[]

    $: property = modelSlot as Property
    $: propertyDescriptor = propertyDescriptors.mandatory(property)
    $: value = propertyDescriptor.getValue(systemConfiguration, property, record) ?? null
    $: viewer = slotViewerRegistry.forSlot(modelSlot)

    afterUpdate(() => console.log({property, propertyDescriptor, value, viewer}))
</script>

{#if viewer}
    <svelte:component
            this={viewer}
            {value}
            {property}/>
{:else}
    <div>Unknown slot type: {modelSlot._type}</div>
{/if}
