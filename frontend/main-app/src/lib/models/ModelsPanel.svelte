<script lang="ts">
    import {ModelEditor} from "@cozemble/model-editor";
    import {addNewModel, allModels, host, modelBeingEdited, putAllModels} from "./modelsStore";
    import {backendTenant} from "../tenants/tenantStore";
    import ModelList from "$lib/models/ModelList.svelte";

    async function saveModelBeingEdited() {
        await putAllModels($backendTenant, $allModels).then(() => {
            modelBeingEdited.set(null)
        })
        modelBeingEdited.set(null)
    }
</script>
<div class="model-editor-container">
{#if $modelBeingEdited}
        <ModelEditor {allModels} {host} modelId={$modelBeingEdited.modelId}/>
    <br/>
    <button type="button" on:click={saveModelBeingEdited}>Save model</button>
    <button type="button" on:click={() => modelBeingEdited.set(null)}>Cancel</button>
{:else}
    {#if $allModels.length === 0}
        <p>Everything in cozemble is based on models. Click the button below to create your first one.</p>
        <button type="button" on:click={addNewModel}>Add first model</button>
    {:else}
        <ModelList/>
        <br/>
        <button type="button" on:click={addNewModel}>Add another model</button>
    {/if}
{/if}
</div>

<style>
    button {
        margin-top: 0.5em;
    }

    .model-editor-container {
        margin-top: 1em;
        padding-left: 1em;
        padding-bottom: 1em;
        border-radius: 0.5em;
        border: 1px solid #ccc;
        background-color: lightcyan;
    }
</style>