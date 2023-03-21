<script lang="ts">
    import {allModels, host, putAllModels} from "./modelsStore";

    import {ModelEditor} from "@cozemble/model-editor";
    import type {ModelId, ModelViewId} from "@cozemble/model-core";
    import {afterUpdate, createEventDispatcher} from "svelte";
    import {putEditedSummaryView, putNewSummaryView, tenantEntities} from "./tenantEntityStore";
    import {getSummaryView} from "./views";
    import EditModelSummaryView from './EditModelSummaryView.svelte';
    import CreateModelSummaryView from './CreateModelSummaryView.svelte';

    export let tenantId: string
    export let modelId: ModelId
    const dispatch = createEventDispatcher()

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

    afterUpdate(() => {
        console.log({summaryView, entities: $tenantEntities})
    })
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
        <ModelEditor {allModels} {host} {modelId}/>
        <br/>
        <button class="btn" type="button" on:click={saveModelBeingEdited}>Save model</button>
        <button class="btn" type="button" on:click={() => dispatch('finished')}>Cancel</button>
    {/if}
    {#if sectionToShow === 'appearance'}
        <h4>Summary card HTML</h4>
        {#if summaryView}
            <EditModelSummaryView {summaryView} saveHandler={summaryViewEdited}/>
        {:else}
            <CreateModelSummaryView saveHandler={summaryViewCreated}/>
        {/if}
    {/if}
</div>
