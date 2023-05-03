<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {loadRecords} from "./loadRecords";
    import {records} from "./recordsStore";
    import {onDestroy, onMount} from "svelte";
    import DataPanelInner from "./DataPanelInner.svelte";
    import {toFilledFilterInstanceGroup} from "@cozemble/frontend-ui-blocks";
    import {filledFilterInstanceGroupFns} from "@cozemble/backend-tenanted-api-types";

    export let tenantId: string
    export let models: Model[]
    export let model: Model
    let searchText: string | null = null
    let filters = filledFilterInstanceGroupFns.empty()

    onMount(async () => {
        try {
            const initialRecords = await loadRecords(tenantId, model.id.value)
            records.set(initialRecords.records)
        } catch (e) {
            console.error(e)
        }
    })

    async function searchTextChanged(event: CustomEvent) {
        searchText = event.detail
        try {
            const loaded = await loadRecords(tenantId, model.id.value, searchText, filters)
            records.set(loaded.records)
        } catch (e) {
            console.error(e)
        }
    }

    async function filtersChanged(event: CustomEvent) {
        const editedFilters = event.detail
        filters = toFilledFilterInstanceGroup(editedFilters)
        try {
            const loaded = await loadRecords(tenantId, model.id.value, searchText, filters)
            records.set(loaded.records)
        } catch (e) {
            console.error(e)
        }
    }

    onDestroy(() => records.set([]))
</script>

<DataPanelInner {models} {model} {tenantId} {records} on:searchTextChanged={searchTextChanged}
                on:filtersChanged={filtersChanged}/>
