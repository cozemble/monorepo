<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";
    import type {Writable} from "svelte/store";
    import {createEventDispatcher} from "svelte";
    import {getSystemConfiguration, modelViews, tenantEntities} from "../models/tenantEntityStore";
    import {makePaginatedEditorHost} from "./paginatedEditorHost";
    import ShowFilterButton from "./filtering/ShowFilterButton.svelte";
    import FilterConfigurer from "./filtering/FilterConfigurer.svelte";
    import {
        type FilterAction,
        filterGroupListFns,
        partiallyAppliedFilterGroupListReducer
    } from "@cozemble/data-filters-core";
    import {getFilterLhsOptionsForModel} from "./filtering/filtering";

    export let models: Model[]
    export let model: Model
    export let tenantId: string
    export let records: Writable<DataRecord[]>

    const dispatch = createEventDispatcher()
    const paginatedEditorHost = makePaginatedEditorHost(tenantId, models, model, records)
    let searchText = ""
    let rootFilter = filterGroupListFns.empty()
    let debounceTimeout: any
    let showFilters = false
    const filterLhsOptions = getFilterLhsOptionsForModel(models, model)

    const reducer = partiallyAppliedFilterGroupListReducer(filterLhsOptions)

    function filterActionHandler(action: FilterAction) {
        rootFilter = reducer(action, rootFilter)
    }

    function searchTextChanged() {
        clearTimeout(debounceTimeout)
        debounceTimeout = setTimeout(() => {
            dispatch("searchTextChanged", searchText)
        }, 500)
    }

    function onShowFilters(event: CustomEvent<boolean>) {
        showFilters = event.detail
    }
</script>

<div class="search-panel">
    <ShowFilterButton {models} {model} {rootFilter} on:showFilters={onShowFilters}/>
    <input type="text" class="input input-bordered" placeholder={`Search ${model.name.value}`}
           on:keyup={searchTextChanged}
           bind:value={searchText}/>
    {#if showFilters}
        <div class="mt-2">
            <FilterConfigurer {models} {model} {rootFilter} {filterActionHandler} on:showFilters={onShowFilters}/>
        </div>
    {/if}
</div>
<div class="mt-2">
    <PaginatedEditor systemConfiguration={getSystemConfiguration($tenantEntities)} {models} {model}
                     modelViews={$modelViews} records={$records} {paginatedEditorHost}/>
</div>
<style>
    .search-panel {
        margin-top: 0.5rem;
    }
</style>