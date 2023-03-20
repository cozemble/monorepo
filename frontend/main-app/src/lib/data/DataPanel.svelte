<script lang="ts">
    import {allModels} from "../models/modelsStore";
    import DataPanelWithLoader from "./DataPanelWithLoader.svelte";
    import {records} from "./recordsStore";
    import {navbarState} from "./navbarState";
    import {openRecordViewStore} from "./openRecordViews";
    import {modelFns} from "@cozemble/model-api";
    import OpenRecordWithLoader from "./OpenRecordWithLoader.svelte";

    export let tenantId: string
    $: actualModels = $allModels.map(m => m.model)
    $: rootModels = actualModels.filter(m => m.parentModelId === undefined)
    $: modelToShow = rootModels.find(m => m.id.value === $navbarState) ?? null
    $: openRecordToShow = $openRecordViewStore.find(or => or.recordId.value === $navbarState)

    function showModel(modelId: string) {
        records.set([])
        navbarState.set(modelId)
    }

    function showRecord(recordId: string) {
        navbarState.set(recordId)
    }
</script>

{#if rootModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else if rootModels.length === 1 && $openRecordViewStore.length === 0}
    <DataPanelWithLoader models={actualModels} model={rootModels[0]} {tenantId}/>
{:else}
    <div class="navbar bg-base-300 rounded-xl">
        <div>
            <ul class="menu menu-horizontal px-1">
                {#each rootModels as model}
                    <li class:active-nav-item={$navbarState === model.id.value}
                        on:click={() => showModel(model.id.value)}><a>{model.name.value}</a></li>
                {/each}
                {#each $openRecordViewStore as openRecordView}
                    {@const model = modelFns.findById(actualModels, openRecordView.modelId)}
                    <li class:active-nav-item={$navbarState === openRecordView.recordId.value}
                        on:click={() => showRecord(openRecordView.recordId.value)}><a>A {model.name.value} record</a></li>
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

{#if openRecordToShow}
    {#key openRecordToShow.recordId.value}
        <OpenRecordWithLoader models={actualModels} openRecord={openRecordToShow} {tenantId}/>
    {/key}
{/if}
