<script lang="ts">
    import {addNewModel, allModels, modelBeingEdited} from "./modelsStore";
    import ModelList from "./ModelList.svelte";
    import EditModel from "./EditModel.svelte";

    export let tenantId: string

</script>
{#if $modelBeingEdited}
    <EditModel modelId={$modelBeingEdited.modelId} {tenantId} on:finished={() => modelBeingEdited.set(null)}/>
{:else}
    {#if $allModels.length === 0}
        <p>Everything in cozemble is based on models. Click the button below to create your first one.</p>
        <button class="btn btn-primary" type="button" on:click={addNewModel}>Add first model</button>
    {:else}
        <ModelList/>
        <br/>
        <button class="btn btn-primary" type="button" on:click={addNewModel}>Add another model</button>
    {/if}
{/if}

<style>
    button {
        margin-top: 0.5em;
    }

</style>