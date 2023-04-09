<script lang="ts">

    import type {FilterInstance} from "@cozemble/data-filters";
    import type {FilterActionHandler} from "@cozemble/data-filters";
    import {onlyUserSelectedRhsValues} from "./onlyUserSelectedRhsValues";
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
