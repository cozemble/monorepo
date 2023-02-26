<script lang="ts">
    import {ModelEditor} from "@cozemble/model-editor";
    import {addNewModel, allModels, host, modelBeingEdited} from "./modelsStore";

    function saveModelBeingEdited() {
        console.log({modelBeingEdited: $modelBeingEdited, allModels: $allModels})
        modelBeingEdited.set(null)
    }
</script>
{#if $modelBeingEdited}
    <div class="model-editor-container">
        <ModelEditor {allModels} {host} modelId={$modelBeingEdited.modelId}/>
    </div>
    <br/>
    <button type="button" on:click={saveModelBeingEdited}>Save</button>
{:else}
    {#if $allModels.length === 0}
        <p>Everything in cozemble is based on models. Click the button below to create your first one.</p>
        <button type="button" on:click={addNewModel}>Add model</button>
    {:else}
        <p>Click on a model to edit it.</p>
    {/if}
{/if}

<style>
    button {
        margin-top: 0.5em;
    }

    .model-editor-container {
        margin-top: 1em;
        padding-left: 1em;
        padding-bottom: 1em;
        /* rounded corners */
        border-radius: 0.5em;
        border: 1px solid #ccc;
        background-color: lightcyan;
    }
</style>