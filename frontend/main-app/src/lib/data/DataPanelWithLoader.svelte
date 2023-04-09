<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import {loadRecords} from "./loadRecords";
    import {records} from "./recordsStore";
    import {onDestroy, onMount} from "svelte";
    import DataPanelInner from "./DataPanelInner.svelte";
    import {toFilledFilterInstanceGroup} from "./filtering/filtering";

    export let tenantId: string
    export let models: Model[]
    export let model: Model

    onMount(async () => {
        try {
            const initialRecords = await loadRecords(tenantId, model.id.value)
            records.set(initialRecords.records)
        } catch (e) {
            console.error(e)
        }
    })

    async function searchTextChanged(event: CustomEvent) {
        const searchText = event.detail
        try {
            const loaded = await loadRecords(tenantId, model.id.value, searchText)
            records.set(loaded.records)
        } catch (e) {
            console.error(e)
        }
    }

    async function filtersChanged(event: CustomEvent) {
        const filters = event.detail
        const filledFilters = toFilledFilterInstanceGroup(filters)
        console.log({filters, filledFilters})
    }

    onDestroy(() => records.set([]))
</script>

<DataPanelInner {models} {model} {tenantId} {records} on:searchTextChanged={searchTextChanged} on:filtersChanged={filtersChanged}/>
