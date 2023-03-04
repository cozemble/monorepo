<script lang="ts">
    import {allModels} from "../models/modelsStore";
    import {afterUpdate} from "svelte";
    import DataPanelWithLoader from "./DataPanelWithLoader.svelte";

    export let tenantId: string
    $: actualModels = $allModels.map(m => m.model)
    $: rootModels = actualModels.filter(m => m.parentModelId === undefined)

    afterUpdate(() => {
        console.log({actualModels, rootModels, modelIdToShow})
    })
    let modelIdToShow = ''
    $: modelToShow = rootModels.find(m => m.id.value === modelIdToShow) ?? null
</script>

{#if rootModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else if rootModels.length === 1}
    <DataPanelWithLoader models={actualModels} model={rootModels[0]} {tenantId}/>
{:else}
    <div class="nav-container">
        {#each rootModels as model}
            <a href="#!" class="tab-item-name" class:current={modelIdToShow === model.id.value}
               on:click={() => modelIdToShow= model.id.value}>{model.name.value}</a>
        {/each}
    </div>
{/if}

{#if modelToShow}
    {#key modelToShow.id.value}
        <DataPanelWithLoader models={actualModels} model={modelToShow} {tenantId}/>
    {/key}
{/if}

<style>
    .tab-item-name {
        border: solid 1px;
        padding: 0.3em;
        margin: 0.3em;
    }

    .current {
        background-color: chartreuse;
    }

    .nav-container {
        display: flex;
        flex-direction: row;
    }

</style>
