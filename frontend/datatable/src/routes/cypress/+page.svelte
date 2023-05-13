<script lang="ts">
    import type {EventSourcedModel} from "@cozemble/model-event-sourced";
    import type {ModelView} from "@cozemble/model-core";
    import {systemConfigurationFns} from "@cozemble/model-core";
    import {registerEverything} from "@cozemble/model-assembled";
    import {onMount} from 'svelte'
    import {writable} from "svelte/store";
    import {backendFns, DataTable, eventSourcedModelStore} from "../../lib";
    import {testModelsLocalStorageKey} from "./testModels";
    import {testRecordsLocalStorageKey} from "./testModels.js";
    import type {DataRecord} from "@cozemble/model-core/dist/esm";
    import {InMemoryBackend} from "../../lib/backend/InMemoryBackend";
    import DevOptions from "../DevOptions.svelte";

    const modelViews = writable([] as ModelView[])
    let models = [] as EventSourcedModel[]
    const systemConfiguration = systemConfigurationFns.empty()
    const permitModelling = writable(true)
    const showDevConsole = writable(false)


    let mounted = false
    onMount(() => {
        registerEverything()
        const storedModelJson = localStorage.getItem(testModelsLocalStorageKey) ?? '[]'
        const storedRecordsJson = localStorage.getItem(testRecordsLocalStorageKey) ?? '[]'
        models = JSON.parse(storedModelJson)
        const modelMap = new Map<string, EventSourcedModel>()
        for (const model of models) {
            modelMap.set(model.model.id.value, model)
        }
        const records = JSON.parse(storedRecordsJson) as DataRecord[]
        const recordMap = new Map<string, DataRecord[]>()
        for (const record of records) {
            const modelRecords = recordMap.get(record.modelId.value) ?? []
            modelRecords.push(record)
            recordMap.set(record.modelId.value, modelRecords)
        }
        backendFns.setBackend(new InMemoryBackend(modelMap, recordMap))
        mounted = true
    })
</script>

{#if mounted}
    <DevOptions {permitModelling} {showDevConsole}/>
    <DataTable models={eventSourcedModelStore(models)}
               {modelViews}
               {systemConfiguration}
               userId="test"
               {showDevConsole}
               {permitModelling}/>
{/if}