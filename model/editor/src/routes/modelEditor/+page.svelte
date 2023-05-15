<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers,} from '@cozemble/model-assembled'
    import ModelEditor from '../../lib/ModelEditor.svelte'
    import {bootstrapHost, clearLocalStorage, host, modelGraph} from './host'
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import {eventSourcedModelGraphFns, modelGraphEvents} from "@cozemble/model-event-sourced";
    import {events, eventTypes} from './toSql'
    import {modelFns} from "@cozemble/model-api";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {derived} from "svelte/store";

    let mounted = false
    let firstModel: EventSourcedModel | null = null
    let eventIndexToShow: number | null = null
    let modelIndexToShow: number | null = null
    const systemConfiguration = systemConfigurationFns.empty()
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
        bootstrapHost(localStorage)
        firstModel = $modelGraph.models[0]
    })

    function showEvent(index: number) {
        eventIndexToShow = index
    }

    function showModel(index: number) {
        modelIndexToShow = index
    }

    function clearClicked() {
        clearLocalStorage(localStorage)
        firstModel = $modelGraph.models[0]
    }

    function addModel() {
        modelGraph.update(graph => eventSourcedModelGraphFns.applyModelGraphEvent(graph, modelGraphEvents.addModel(modelFns.newInstance("Random model"))))
    }

    const allModels = derived(modelGraph, $modelGraph => $modelGraph.models)
</script>

<div class="ml-4 mt-4">
    <button class="btn mb-4" on:click={addModel}>Add a random model</button>
    {#if mounted && firstModel}
        <ModelEditor {systemConfiguration} modelId={firstModel.model.id} {modelGraph} {host}/>
    {/if}
    <hr class="mt-4"/>

    <div class="inspector mt-4">
        <div class="events-inspector">
            <div class="event-types">
                <h5>Event types</h5>
                {#each $eventTypes as eventType, index}
                    <a href="#!" class="event-type" on:click={() => showEvent(index)}>{index}. {eventType}</a><br/>
                {/each}
            </div>
            {#if eventIndexToShow !== null}
                <div class="event-type">
                    <h5>Event {eventIndexToShow}</h5>
                    <pre>{JSON.stringify($events[eventIndexToShow].event, null, 2)}</pre>
                </div>
            {/if}
        </div>
        <div class="models-inspector">
            <h5>Models</h5>
            {#each $allModels as model, index}
                <a href="#!" class="model-name" on:click={() => showModel(index)}>{index}
                    . {model.model.name.value}</a><br/>
            {/each}
            {#if modelIndexToShow !== null}
                {@const model = $allModels[modelIndexToShow]}
                <div class="model-type">
                    <h5>Showing model {model.model.name.value}</h5>
                    <pre>{JSON.stringify($allModels[modelIndexToShow].model, null, 2)}</pre>
                </div>
            {/if}
        </div>
    </div>
    <div class="controls">
        <button type="button" class="btn" on:click={clearClicked}>Clear</button>
    </div>
</div>

<style>
    .inspector {
        display: flex;
        flex-direction: row;
    }

    .events-inspector {
        margin-right: 1rem;
    }

    .controls {
        margin-top: 1rem;
    }
</style>
