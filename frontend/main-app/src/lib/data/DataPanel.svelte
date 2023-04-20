<script lang="ts">
    import {allModels} from "../models/modelsStore";
    import DataPanelWithLoader from "./DataPanelWithLoader.svelte";
    import {records} from "./recordsStore";
    import {navbarState} from "./navbarState";
    import {openRecordViewStore} from "./openRecordViews";
    import {modelFns} from "@cozemble/model-api";
    import OpenRecordWithLoader from "./OpenRecordWithLoader.svelte";
    import {onMount} from "svelte";

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

    onMount(() => {
        if (rootModels.length > 0) {
            showModel(rootModels[0].id.value)
        }
    })
</script>

{#if rootModels.length === 0}
    <p>When you have created your first model, you will be able to edit data here</p>
{:else}
    <div class="tabs bg-base-300 rounded p-1">
        {#each rootModels as model}
            <a class="tab tab-lg  tab-bordered" class:tab-active={$navbarState === model.id.value}
               on:click={() => showModel(model.id.value)}>{model.name.value}</a>
        {/each}
        {#each $openRecordViewStore as openRecordView}
            {@const model = modelFns.findById(actualModels, openRecordView.modelId)}
            <a class="tab tab-lg  tab-bordered" class:tab-active={$navbarState === openRecordView.recordId.value}
               on:click={() => showRecord(openRecordView.recordId.value)}>A {model.name.value} record</a>
        {/each}

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
