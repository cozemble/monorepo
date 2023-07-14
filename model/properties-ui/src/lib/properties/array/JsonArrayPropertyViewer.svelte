<script lang="ts">
    import type {JsonArrayProperty} from "@cozemble/model-properties-core";
    import {slotViewerRegistry} from "@cozemble/model-registries";

    export let value: any[] | null
    export let property: JsonArrayProperty

    $: viewer = property?.configuration?.itemType ? slotViewerRegistry.forPropertyType(property.configuration.itemType) : null

</script>
{#if viewer}
    {#if value}
        {#each value as item}
            <div class="flex flex-row items-center">
                <svelte:component this={viewer} value={item}/>
            </div>
        {/each}
    {/if}
{:else}
    No viewer found for property type {property.configuration.itemType}
{/if}