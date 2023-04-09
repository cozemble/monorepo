<script lang="ts">
    import type {FilterInstance, FilterInstanceList} from "@cozemble/data-filters";
    import ConjunctionView from "./ConjunctionView.svelte";
    import type {FilterActionHandler} from "@cozemble/data-filters";
    import {filterActions} from "@cozemble/data-filters";
    import FilterRhsConfigurer from "./FilterRhsConfigurer.svelte";
    import type {SelectChangeEvent} from "./types";
    import UserSelectedRhsValue from "./UserSelectedRhsValue.svelte";
    import {filterInstances} from "@cozemble/data-filters";
    import {onlyUserSelectedRhsValues} from "./onlyUserSelectedRhsValues";
    import {TrashIcon} from "@cozemble/ui-atoms";

    export let list: FilterInstanceList
    export let filterActionHandler: FilterActionHandler
    export let allowGroups: boolean
    export let allowAdding = true
    export let filterAlias = "filter"

    function requiresRhs(filter: FilterInstance) {
        return filter.selectedOperatorOption?.requiresRhs !== false
    }

    function addFilter() {
        filterActionHandler(filterActions.newFilterInstance(list.id))
    }

    function lhsChanged(changeEvent: Event, filter: FilterInstance) {
        const target = changeEvent.target as HTMLSelectElement
        filterActionHandler(filterActions.lhsChanged(filter.id, target.value))
    }

    function operatorChanged(changeEvent: Event, filter: FilterInstance) {
        const target = changeEvent.target as HTMLSelectElement
        filterActionHandler(filterActions.operatorChanged(filter.id, target.value))
    }

    function conjunctionChanged(event: CustomEvent) {
        filterActionHandler(filterActions.filterInstanceListConjunctionChanged(list.id, event.detail.conjunction))
    }

    function deleteFilter(filter: FilterInstance) {
        filterActionHandler(filterActions.deleteFilterInstance(list.id, filter.id))
    }
</script>

{#each list.filters as filter, filterIndex}
    <div class="mt-2 flex content-center">
        {#if filterIndex === 1}
            <ConjunctionView conjunction={list.conjunction} classes="mr-2"
                             on:conjunctionChanged={(event) => conjunctionChanged(event)}/>
        {/if}
        {#if filterIndex > 1}
            <ConjunctionView conjunction={list.conjunction} classes="mr-2" disabled={true}/>
        {/if}
            <select class="input input-bordered" on:change={(event) => lhsChanged(event, filter)}>
                <option value={null} selected={filter.selectedLhsOption === null}>-----</option>
                {#each filter.lhsOptions as lhsOption}
                    <option value={lhsOption.id}
                            selected={filter.selectedLhsOption?.id === lhsOption.id}>{lhsOption.label}</option>
                {/each}
            </select>
        {#if filter.selectedLhsOption}
            <div class="ml-2">
                <select class="input input-bordered" on:change={(event) => operatorChanged(event, filter)}>
                    <option value={null} selected={filter.selectedOperatorOption === null}>-----</option>
                    {#each filter.selectedLhsOption.operators as operator}
                        <option value={operator.id}
                                selected={filter.selectedOperatorOption?.id === operator.id}>{operator.label}</option>
                    {/each}
                </select>
            </div>
            {#if filter.selectedOperatorOption && requiresRhs(filter)}
                <div class="ml-2">
                    <FilterRhsConfigurer {filter} {filterActionHandler}/>
                </div>
            {/if}
            {#if filterInstances.userSuppliedRhsSelected(filter) && !onlyUserSelectedRhsValues(filter.selectedLhsOption)}
                    <div class="ml-2">
                        <UserSelectedRhsValue {filter} {filterActionHandler}/>
                    </div>
            {/if}
        {/if}
        <div class="ml-2 self-center">
            <button class="btn btn-ghost btn-active btn-xs" title="Delete this {filterAlias}">Delete</button>
        </div>
    </div>
{/each}
{#if allowAdding}
    <div class="mt-2 mb-2">
        <button class="btn btn-ghost btn-active" on:click={addFilter}>Add {filterAlias}</button>
        {#if allowGroups}
            <button class="btn btn-ghost btn-active"
                    on:click={() => filterActionHandler(filterActions.convertFilterInstanceGroupToFilterGroup(list.id))}>
                Add group
            </button>
        {/if}
    </div>
{/if}
