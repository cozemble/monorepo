<script lang="ts">
    import {allModels} from "../models/modelsStore";
    import DataPanelWithLoader from "./DataPanelWithLoader.svelte";
    import {records} from "./recordsStore";

    export let tenantId: string
    $: actualModels = $allModels.map(m => m.model)
    $: rootModels = actualModels.filter(m => m.parentModelId === undefined)

    let modelIdToShow = ''
    $: modelToShow = rootModels.find(m => m.id.value === modelIdToShow) ?? null

    function showModel(modelId: string) {
        records.set([])
        modelIdToShow = modelId
    }
</script>

{#if rootModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else if rootModels.length === 1}
    <DataPanelWithLoader models={actualModels} model={rootModels[0]} {tenantId}/>
{:else}
    <div class="navbar bg-base-300 rounded-xl">
        <div>
            <ul class="menu menu-horizontal px-1">
                {#each rootModels as model}
                    <li  class:active-nav-item={modelIdToShow === model.id.value} on:click={() => showModel(model.id.value)}><a>{model.name.value}</a></li>
                {/each}
            </ul>
        </div>
    </div>
{/if}

{#if modelToShow}
    {#key modelToShow.id.value}
        <DataPanelWithLoader models={actualModels} model={modelToShow} {tenantId}/>
    {/key}
{/if}
