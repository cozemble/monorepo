<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {createEventDispatcher} from "svelte";
    import {getFilterablePaths} from "./filtering";

    export let model: Model
    export let models: Model[]

    const filterablePaths = getFilterablePaths(models, model)
    const dispatch = createEventDispatcher()
    let showFilters = false

    function toggleFilters() {
        showFilters = !showFilters
        dispatch('showFilters', showFilters)
    }
</script>
{#if filterablePaths.length > 0}
    <button class="btn btn-ghost btn-active" on:click={toggleFilters}>Filters</button>
{/if}
