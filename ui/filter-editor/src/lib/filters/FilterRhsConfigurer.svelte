<script lang="ts">

    import type {FilterInstance} from "@cozemble/data-filters-core";
    import type {FilterActionHandler} from "@cozemble/data-filters-core";
    import {onlyUserSelectedRhsValues} from "./onlyUserSelectedRhsValues.js";
    import RhsOptionTypePicker from "./RhsOptionTypePicker.svelte";
    import UserSelectedRhsValue from "./UserSelectedRhsValue.svelte";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler
</script>

{#if filter.selectedLhsOption && filter.selectedOperatorOption}
    {#if onlyUserSelectedRhsValues(filter.selectedLhsOption)}
        <UserSelectedRhsValue {filter} {filterActionHandler}/>
    {:else}
        <RhsOptionTypePicker {filter} {filterActionHandler}/>
    {/if}
{/if}
