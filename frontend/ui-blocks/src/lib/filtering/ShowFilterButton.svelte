<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {createEventDispatcher} from "svelte";
    import {getFilterablePaths} from "./filtering";
    import type {FilterGroupList} from "@cozemble/data-filters-core";
    import {filterGroupListFns} from "@cozemble/data-filters-core";
    import {afterUpdate} from "svelte";

    export let model: Model
    export let models: Model[]
    export let rootFilter: FilterGroupList
    $: buttonText = filterGroupListFns.hasFilterInstances(rootFilter) ? `Filters (${filterGroupListFns.filterInstanceCount(rootFilter)})` : 'Add filter'

    $: filterablePaths = getFilterablePaths(models, model)
    const dispatch = createEventDispatcher()
    let showFilters = false

    function toggleFilters() {
        showFilters = !showFilters
        dispatch('showFilters', showFilters)
    }

    afterUpdate(() => console.log({model,filterablePaths}))
</script>

{#if filterablePaths.length > 0}
    <button class="btn btn-ghost btn-active" on:click={toggleFilters}>{buttonText}</button>
{/if}
