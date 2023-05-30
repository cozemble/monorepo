<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {derived, writable} from "svelte/store";
    import type {Model, ModelId, NestedModelId} from "@cozemble/model-core";
    import {eventSourcedModelFns, eventSourcedRecordGraphFns} from "@cozemble/model-event-sourced";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {emptyDataTableFocus} from "../focus/DataTableFocus";
    import {gettableWritable} from "../editors/GettableWritable";
    import {makeFocusControls} from "./makeFocusControls";
    import {onDestroy} from "svelte";
    import type {LoadingState} from "./RecordsContext";
    import {backend, getRecordsForModel} from "../appBackend";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {eventSourcedRecordGraphStore} from "./EventSourcedRecordGraphStore";
    import {makeRecordControls} from "./makeRecordControls";
    import {currentUserId} from "../stores/currentUserId";
    import {makeModelControls} from "./makeModelControls";
    import type {ErrorVisibilityByRecordId} from "./helpers";
    import {emptyFilterParams, type FilterParams, type RecordSaver} from "../backend/Backend";
    import {dataRecordFns} from "@cozemble/model-api";
    import type {RecordGraphLoader} from "$lib/records/RecordGraphLoader";
    import type {EventSourcedDataRecord} from "@cozemble/model-event-sourced";
    import {eventSourcedDataRecordFns} from "@cozemble/model-event-sourced";
    import type {SubGraphCollectorsByRecordId} from "$lib/records/RecordControls";

    const systemConfigurationProvider = () => $systemConfiguration
    const modelsProvider = () => $allModels

    export let modelId: ModelId
    export let graphLoader: RecordGraphLoader = getRecordsForModel
    export let eventSourcedRecordGraph = eventSourcedRecordGraphStore(systemConfigurationProvider, modelsProvider, () => $model, $currentUserId)
    export let recordSaver: RecordSaver = backend
    export let oneOnly = false
    export let permitRecordAdditions = true

    const eventSourcedModel = derived(allEventSourcedModels, list => eventSourcedModelFns.findById(list.models, modelId))
    const model = derived(eventSourcedModel, model => model.model)
    const eventSourcedRecords = derived(eventSourcedRecordGraph, graph => graph.records)
    const records = derived(eventSourcedRecords, records => records.map(r => r.record))
    const errorVisibilityByRecordId = gettableWritable(new Map() as ErrorVisibilityByRecordId)
    const focus = gettableWritable(emptyDataTableFocus(() => $records))
    const focusControls = makeFocusControls(modelsProvider, () => $records, systemConfigurationProvider, focus)
    const lastSavedByRecordId = writable(new Map<string, number>())
    const dirtyRecords = derived([eventSourcedRecordGraph, lastSavedByRecordId], ([graph, lastSavedByRecordId]) => {
        return eventSourcedRecordGraphFns.recordsChangedSince(graph, lastSavedByRecordId).map(r => r.record.id)
    })
    const loadingState = writable('loading' as LoadingState)
    const filterParams = writable(emptyFilterParams())
    const subGraphCollectorsByRecordId = {} as SubGraphCollectorsByRecordId
    let debounceTimeout: any

    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setSubGraphCollectorsByRecordId(subGraphCollectorsByRecordId)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setEventSourcedRecordGraph(eventSourcedRecordGraph)
    modelRecordsContextFns.setRecords(records)
    modelRecordsContextFns.setFocus(focus)
    modelRecordsContextFns.setFocusControls(focusControls)
    modelRecordsContextFns.setDirtyRecords(dirtyRecords)
    modelRecordsContextFns.setRecordControls(makeRecordControls(systemConfigurationProvider, recordSaver, modelsProvider, errorVisibilityByRecordId, eventSourcedRecordGraph, lastSavedByRecordId, subGraphCollectorsByRecordId))
    modelRecordsContextFns.setModelControls(makeModelControls(allEventSourcedModels))
    modelRecordsContextFns.setErrorVisibilityByRecordId(errorVisibilityByRecordId)
    modelRecordsContextFns.setFilterParams(filterParams)
    modelRecordsContextFns.setNestedModelBeingEdited(writable(null as NestedModelId | null))
    modelRecordsContextFns.setPermitRecordAdditions(writable(permitRecordAdditions))

    let someRecordsLoaded = false

    const unsubAllEventSourcedModels = allModels.subscribe(models => {
        eventSourcedRecordGraph.update(graph => {
            return eventSourcedRecordGraphFns.updateModelsInDataRecords(graph, models)
        })
    })

    function newEmptyRecord(model: Model): EventSourcedDataRecord {
        return eventSourcedDataRecordFns.fromRecord($allModels, dataRecordFns.newInstance(model, $currentUserId))
    }

    async function loadRecords(filterParams: FilterParams) {
        loadingState.set('loading')
        let loadedGraph = await graphLoader(modelId, filterParams)
        console.log({loadedGraph})
        if (oneOnly) {
            eventSourcedRecordGraph.set(
                loadedGraph,
            )
        } else {
            loadedGraph = eventSourcedRecordGraphFns.appendRecord(loadedGraph, newEmptyRecord($model))
            eventSourcedRecordGraph.set(
                loadedGraph,
            )
        }
        someRecordsLoaded = true
        loadingState.set('loaded')
    }

    const unsubFilterParams = filterParams.subscribe(filterParams => {
        debounceTimeout = setTimeout(() => {
            loadRecords(filterParams)
        }, someRecordsLoaded ? 500 : 0)
    })

    onDestroy(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout)
        }
        unsubFilterParams()
        unsubAllEventSourcedModels()
    })
</script>
<slot {focusControls}></slot>