<script lang="ts">

    import {
        type FilterAction,
        filterGroupListFns,
        partiallyAppliedFilterGroupListReducer
    } from "@cozemble/data-filters-core";

    import {FilterConfigurer, getFilterLhsOptionsForModel, ShowFilterButton} from "@cozemble/frontend-ui-blocks";
    import {createEventDispatcher} from "svelte";
    import {modelRecordsContextFns} from "../records/modelRecordsContextFns";
    import {allModels} from "../stores/allModels";

    const models = $allModels
    const model = modelRecordsContextFns.getModel()

    const dispatch = createEventDispatcher()
    let searchText = ""
    let rootFilter = filterGroupListFns.empty()
    let debounceTimeout: any
    let showFilters = false
    $: filterLhsOptions = getFilterLhsOptionsForModel(models, $model)
    $: reducer = partiallyAppliedFilterGroupListReducer(filterLhsOptions)


    function onShowFilters(event: CustomEvent<boolean>) {
        showFilters = event.detail
    }

    function searchTextChanged() {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            dispatch("searchTextChanged", searchText)
        }, 500)
    }

    function filterActionHandler(action: FilterAction) {
        rootFilter = reducer(action, rootFilter)
        if (filterGroupListFns.allFiltersAreFullySpecified(rootFilter)) {
            dispatch("filtersChanged", rootFilter)
        }
    }

</script>

<div class="mb-2 flex flex-col w-full">
    <div class="flex justify-between">
        <ShowFilterButton {models} model={$model} {rootFilter} on:showFilters={onShowFilters}/>
        <input type="text" class="search-input input input-bordered" placeholder={`Search ${$model.name.value}`}
               on:keyup={searchTextChanged}
               bind:value={searchText}/>
    </div>

    {#if showFilters}
        <div class="mt-2">
            <FilterConfigurer {models} model={$model} {rootFilter} {filterActionHandler}
                              on:showFilters={onShowFilters}/>
        </div>
    {/if}
</div>

<style>
    .search-input {
        margin-left: auto;
    }
</style>