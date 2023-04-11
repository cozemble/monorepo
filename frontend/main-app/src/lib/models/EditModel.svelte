<script lang="ts">
    import {allModels, host, putAllModels} from "./modelsStore";

    import {ModelEditor} from "@cozemble/model-editor";
    import type {ModelId, ModelViewId} from "@cozemble/model-core";
    import {createEventDispatcher} from "svelte";
    import {putEditedSummaryView, putNewSummaryView, systemConfiguration, tenantEntities} from "./tenantEntityStore";
    import {getSummaryView} from "./views";
    import EditModelSummaryView from './EditModelSummaryView.svelte';
    import CreateModelSummaryView from './CreateModelSummaryView.svelte';

    export let tenantId: string
    export let modelId: ModelId
    export let editImmediately = false

    const dispatch = createEventDispatcher()
    let showModelSaveButtons = true

    async function saveModelBeingEdited() {
        await putAllModels(tenantId, $allModels)
        dispatch('finished')
    }

    let sectionToShow = 'model'

    $: summaryView = getSummaryView(modelId, $tenantEntities)

    async function summaryViewCreated(template: string) {
        await putNewSummaryView(tenantId, modelId, template)
    }

    async function summaryViewEdited(viewId: ModelViewId, template: string) {
        await putEditedSummaryView(tenantId, modelId, viewId, template)
    }

    function editingSomething(event: CustomEvent) {
        const editingSomething = event.detail
        showModelSaveButtons = !editingSomething
    }
</script>


<div class="navbar bg-base-300 rounded-xl">
    <div>
        <ul class="menu menu-horizontal px-1">
            <li class:active-nav-item={sectionToShow === 'model'} on:click={() => sectionToShow= 'model'}><a>Model</a>
            </li>
            <li class:active-nav-item={sectionToShow === 'appearance'} on:click={() => sectionToShow= 'appearance'}><a>Appearance</a>
            </li>
        </ul>
    </div>
</div>

<div class="mt-3">
    {#if sectionToShow === 'model'}
        <ModelEditor systemConfiguration={$systemConfiguration} {allModels} {host} {modelId}
                     {editImmediately}
                     on:editingSomething={editingSomething}/>
        <br/>
        {#if showModelSaveButtons}
            <button class="btn btn-primary" type="button" on:click={saveModelBeingEdited}>Save model</button>
            <button class="btn" type="button" on:click={() => dispatch('finished')}>Cancel</button>
        {/if}
    {/if}
    {#if sectionToShow === 'appearance'}
        <h4>Summary card HTML</h4>
        {#if summaryView}
            <EditModelSummaryView {modelId} {summaryView} saveHandler={summaryViewEdited}/>
        {:else}
            <CreateModelSummaryView {modelId} saveHandler={summaryViewCreated}/>
        {/if}
    {/if}
</div>
