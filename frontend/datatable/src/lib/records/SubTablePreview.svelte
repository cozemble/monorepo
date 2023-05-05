<script lang="ts">
    import {createEventDispatcher, onMount} from "svelte";
    import {modelFns} from "@cozemble/model-api";
    import {type DataRecord, modelPluralNameFns} from "@cozemble/model-core";
    import {dataRecordFns, modelOptions, propertyFns} from "@cozemble/model-api";
    import {InMemoryBackend} from "../backend/InMemoryBackend";
    import {RootRecordsContext} from "./RecordsContext";
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {writable} from "svelte/store";
    import DataRecordsTable from "./DataRecordsTable.svelte";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {defaultOnError} from "../appBackend";


    let model = modelFns.newInstance("Sub Item", modelOptions.withProperties(propertyFns.newInstance("Field 1")))
    model.pluralName = modelPluralNameFns.newInstance("Sub Items")
    const models = [model]
    const records = [dataRecordFns.random($systemConfiguration, models, model, {
        "Field 1": "",
    }),
        dataRecordFns.random($systemConfiguration, models, model, {
            "Field 1": "",
        })
    ]
    const dispatch = createEventDispatcher()

    function cancel() {
        dispatch('close')
    }

    function apply() {
        dispatch('apply', model)
    }

    const modelMap = new Map<string, EventSourcedModel>()
    models.forEach(m => modelMap.set(m.id.value, eventSourcedModelFns.newInstance(m)))
    const eventSourcedModels = Array.from(modelMap.values())
    const recordMap = new Map<string, DataRecord[]>()
    recordMap.set(model.id.value, records)
    const backend = new InMemoryBackend(modelMap, recordMap)
    const sampleRecordsContext = new RootRecordsContext(backend, () => $systemConfiguration,defaultOnError,model.id, writable(eventSourcedModels))

    onMount(async () => {
        await sampleRecordsContext.loadRecords()
    })

    function focus(el: HTMLElement) {
        el.focus()
    }

</script>

<div class="card bg-base-200 shadow-xl pt-2">
    <div class="card-body">
        <div class="tooltip tooltip-open tooltip-accent" data-tip="Preview of sub-table">
            <div class="disabled-content border border-info rounded p-2 flex flex-col items-start">
                <h6>{model.pluralName.value}</h6>
                <DataRecordsTable context={sampleRecordsContext}/>
            </div>
        </div>
        <div>
            <label class="label">The sub-table name as a plural should be:</label>
            <input type="text" class="input input-bordered w-full" bind:value={model.pluralName.value} use:focus/>
            <label class="label">The "Add" button text should read:</label>
            <div class="flex items-center">
                <button class="btn btn-primary btn-sm mr-2">Add</button>
                <input type="text" class="input input-bordered w-full" bind:value={model.name.value}/>
            </div>
        </div>
    </div>
</div>

<div class="mt-8">
    <button class="btn btn-secondary" on:click={apply}>Apply sub-section</button>
    <button class="btn" on:click={cancel}>Cancel</button>
</div>

<style>
    .disabled-content {
        pointer-events: none;
        opacity: 0.5;
        border-width: 4px;
    }
</style>