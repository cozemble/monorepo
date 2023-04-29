<script lang="ts">
    import type {FilterInstance} from "@cozemble/data-filters-core";
    import type {FilterActionHandler} from "@cozemble/data-filters-core";
    import {isSelectedRhsOption, rhsOptionsAsSelectOptions} from "./rhsOptionsAsSelectOptions";
    import {filterActions} from "@cozemble/data-filters-core";
    import {mandatory} from "@cozemble/lang-util";

    export let filter: FilterInstance
    export let filterActionHandler: FilterActionHandler

    $: options = rhsOptionsAsSelectOptions(filter.selectedLhsOption)

    function rhsOptionTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const selectedOption = mandatory(options.find(o => o.id === target.value), "No option found")
        filterActionHandler(filterActions.rhsOptionTypeChanged(filter.id, selectedOption))
    }

</script>

<select class="input input-bordered" on:change={rhsOptionTypeChanged}>
    <option value={null} selected={filter.rhsValue === null}>-----</option>
    {#each options as rhsOption}
        <option value={rhsOption.id} selected={isSelectedRhsOption(rhsOption, filter)}>{rhsOption.label}</option>
    {/each}
</select>
