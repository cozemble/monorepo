<script lang="ts">

    import {
        type FilterAction,
        filterGroupListFns,
        partiallyAppliedFilterGroupListReducer
    } from "@cozemble/data-filters-core";

    import {FilterConfigurer, getFilterLhsOptionsForModel, ShowFilterButton} from "@cozemble/frontend-ui-blocks";
    import {modelRecordsContextFns} from "../records/modelRecordsContextFns";
    import {allModels} from "../stores/allModels";

    const model = modelRecordsContextFns.getModel()
    const filterParams = modelRecordsContextFns.getFilterParams()

    let searchText = ""
    let rootFilter = filterGroupListFns.empty()
    let showFilters = false
    $: filterLhsOptions = getFilterLhsOptionsForModel($allModels, $model)
    $: reducer = partiallyAppliedFilterGroupListReducer(filterLhsOptions)

    function onShowFilters(event: CustomEvent<boolean>) {
        showFilters = event.detail
    }

    function searchTextChanged() {
        filterParams.update(params => ({...params, search: searchText}))
    }

    function filterActionHandler(action: FilterAction) {
        rootFilter = reducer(action, rootFilter)
        if (filterGroupListFns.allFiltersAreFullySpecified(rootFilter)) {
            filterParams.update(params => ({...params, filters: rootFilter}))
        }
    }

</script>

<div class="mb-2 flex flex-col w-full">
    <div class="flex justify-between">
        <ShowFilterButton models={$allModels} model={$model} {rootFilter} on:showFilters={onShowFilters}/>
        <input type="text" class="search-input input input-bordered" placeholder={`Search ${$model.name.value}`}
               on:keyup={searchTextChanged}
               bind:value={searchText}/>
    </div>

    {#if showFilters}
        <div class="mt-2">
            <FilterConfigurer models={$allModels} model={$model} {rootFilter} {filterActionHandler}
                              on:showFilters={onShowFilters}/>
        </div>
    {/if}
</div>

<style>
    .search-input {
        margin-left: auto;
    }
</style>