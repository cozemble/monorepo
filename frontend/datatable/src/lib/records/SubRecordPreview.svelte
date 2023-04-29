<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import {dataRecordFns, modelFns, modelOptions, propertyFns} from "@cozemble/model-api";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {RootRecordsContext} from "./RecordsContext";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import type {DataRecord} from "@cozemble/model-core";
    import {writable} from "svelte/store";
    import {defaultOnError} from "../appBackend";
    import {modelPluralNameFns} from "@cozemble/model-core";

    let model = modelFns.newInstance("Untitled sub-record", modelOptions.withProperties(propertyFns.newInstance("Field 1")))
    const models = [model]
    const sampleRecord = dataRecordFns.random($systemConfiguration, models, model, {
        "Field 1": "",
    })

    const records = [sampleRecord]
    const dispatch = createEventDispatcher()

    function cancel() {
        dispatch('close')
    }

    function apply() {
        model.pluralName = modelPluralNameFns.newInstance(model.name.value)
        dispatch('apply', model)
    }

    const modelMap = new Map<string, EventSourcedModel>()
    models.forEach(m => modelMap.set(m.id.value, eventSourcedModelFns.newInstance(m)))
    const eventSourcedModels = Array.from(modelMap.values())
    const recordMap = new Map<string, DataRecord[]>()
    recordMap.set(model.id.value, [sampleRecord])
    const backend = new InMemoryBackend(modelMap, recordMap)
    const sampleRecordsContext = new RootRecordsContext(backend, defaultOnError,model.id, writable(eventSourcedModels))

    onMount(async () => {
        await sampleRecordsContext.loadRecords()
    })

    function focus(el: HTMLElement) {
        el.focus()
    }
</script>


<div class="card bg-base-200 shadow-xl pt-2">
    <div class="card-body">
        <div class="tooltip tooltip-open tooltip-accent" data-tip="Preview of your sub-record">
            <div class="disabled-content border border-info rounded p-2 flex flex-col items-start">
                <h6>{model.name.value}</h6>
                <DataRecordsTable context={sampleRecordsContext} expandedRecordId={sampleRecord.id.value}
                                  oneOnly={true}/>

            </div>
        </div>
        <div>
            <label class="label">Sub-record name:</label>
            <input type="text" class="input input-bordered w-full" bind:value={model.name.value} use:focus/>
            <label class="label text-sm">Give your sub-record a name, it will update in the preview above</label>
        </div>
    </div>
</div>


<div class="mt-8">
    <button class="btn btn-secondary" on:click={apply}>Apply sub-item</button>
    <button class="btn ml-2" on:click={cancel}>Cancel</button>
</div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>