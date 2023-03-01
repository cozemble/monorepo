<script lang="ts">
    import DataPanelInner from './DataPanelInner.svelte'
    import {records} from "./recordsHost";
    import {allModels} from "../models/modelsStore";
    import {onMount} from "svelte";
    import {loadInitialRecords} from "./loadInitialRecords";

    export let tenantId: string
    $: actualModels = $allModels.map(m => m.model)

    onMount(async () => {
        try {
            const {records: initialRecords} = await loadInitialRecords(tenantId, actualModels[0].id.value)
            console.log({initialRecords})
            records.set(initialRecords.records)
        } catch (e) {
            console.error(e)
        }
    })
</script>

{#if actualModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else}
    <DataPanelInner models={actualModels} model={actualModels[0]} {records} {tenantId}/>
{/if}
