<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";
    import type {Writable} from "svelte/store";
    import {createEventDispatcher} from "svelte";
    import {getSystemConfiguration, modelViews, tenantEntities} from "../models/tenantEntityStore";
    import {makePaginatedEditorHost} from "./paginatedEditorHost";

    export let models: Model[]
    export let model: Model
    export let tenantId: string
    export let records: Writable<DataRecord[]>

    const dispatch = createEventDispatcher()
    let searchText = ""
    let debounceTimeout: any

    function searchTextChanged() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            dispatch("searchTextChanged", searchText)
        }, 500);
    }

    const paginatedEditorHost = makePaginatedEditorHost(tenantId, models,model, records)
</script>

<div class="search-panel">
    <input type="text" class="input input-bordered" placeholder={`Search ${model.name.value}`}
           on:keyup={searchTextChanged}
           bind:value={searchText}/>
</div>
<div class="mt-2">
    <PaginatedEditor systemConfiguration={getSystemConfiguration($tenantEntities)} {models} {model} modelViews={$modelViews} records={$records} {paginatedEditorHost}/>
</div>
<style>
    .search-panel {
        margin-top: 0.5rem;
    }
</style>