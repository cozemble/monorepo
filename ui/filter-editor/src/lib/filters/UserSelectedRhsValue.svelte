<script lang="ts">
    import type {FilterActionHandler, FilterInstance} from "@cozemble/data-filters";
    import FilterRhsDateConfigurer from "./FilterRhsDateConfigurer.svelte";
    import FilterRhsStringConfigurer from "./FilterRhsStringConfigurer.svelte";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

</script>

{#if filter.selectedLhsOption?.dataType?._type === "date"}
    <FilterRhsDateConfigurer {filter} {filterActionHandler}/>
{:else if filter.selectedLhsOption?.dataType?._type === "string"}
    <FilterRhsStringConfigurer {filter} {filterActionHandler}/>
{:else}
    Don't know how to handle filter of type {filter.selectedLhsOption?.dataType?._type}
{/if}
