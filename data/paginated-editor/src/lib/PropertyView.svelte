<script lang="ts">
    import type {DataRecord, Property} from "@cozemble/model-core";
    import {propertyViewerRegistry} from "@cozemble/model-assembled";

    export let property: Property
    export let record: DataRecord

    $: viewer = propertyViewerRegistry.get(property._type)
</script>

{#if viewer}
    <svelte:component this={viewer} property={property} record={record}/>
{:else}
    <div>Unknown property type: {property._type}</div>
{/if}