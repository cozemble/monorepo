<script lang="ts">
    import {onMount} from 'svelte'

    import {registerAllProperties, registerAllPropertyConfigurers,} from '@cozemble/model-assembled'
    import ModelEditor from '../../lib/ModelEditor.svelte'
    import {bootstrapHost, clearLocalStorage, host, modelList} from './host'
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import {eventSourcedModelListEvents, eventSourcedModelListFns} from "@cozemble/model-event-sourced";
    import {events, eventTypes} from './toSql'
    import {modelFns} from "@cozemble/model-api";
    import {systemConfigurationFns} from "@cozemble/model-core";

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
        firstModel = $modelList.models[0]
    })

    function showEvent(index: number) {
        eventIndexToShow = index
    }

    function showModel(index: number) {
        modelIndexToShow = index
    }

    function clearClicked() {
        clearLocalStorage(localStorage)
        firstModel = $modelList.models[0]
    }

    function addModel() {
        const model = modelFns.newInstance("Random model")
        modelList.update(list => eventSourcedModelListFns.addEvent(list, eventSourcedModelListEvents.addModel(model)))

    }
</script>

<div class="m-4">
    <button class="btn" on:click={addModel}>Add a random model</button>
    {#if mounted && firstModel}
        <ModelEditor {systemConfiguration} modelId={firstModel.model.id} {modelList} {host}/>
    {/if}
    <hr/>
    <br/>
    <div class="inspector">
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
            {#each $modelList.models as model, index}
                <a href="#!" class="model-name" on:click={() => showModel(index)}>{index}
                    . {model.model.name.value}</a><br/>
            {/each}
            {#if modelIndexToShow !== null}
                {@const model = $modelList.models[modelIndexToShow]}
                <div class="model-type">
                    <h5>Showing model {model.model.name.value}</h5>
                    <pre>{JSON.stringify($modelList.models[modelIndexToShow].model, null, 2)}</pre>
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
