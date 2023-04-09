<script lang="ts">
    import type {FilterActionHandler, FilterInstance} from "@cozemble/data-filters-core";
    import {filterValueProviders} from "@cozemble/data-filters-config";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

    function getValueProviderComponent(filter: FilterInstance) {
        if (filter.selectedLhsOption === null) {
            return null
        }
        return filterValueProviders.get(filter.selectedLhsOption.dataType)
    }

    $: valueProviderComponent = getValueProviderComponent(filter)
</script>

{#if valueProviderComponent}
    <svelte:component this={valueProviderComponent.component} {...valueProviderComponent.props} {filter} {filterActionHandler}/>
{:else}
    <div class="text-center text-muted">No value provider registered for
        '{filter.selectedLhsOption?.dataType?.value ?? "undefined"}'
    </div>
{/if}
