<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {derived, writable} from "svelte/store";
    import type {DataRecord, Model, ModelId} from "@cozemble/model-core";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";
    import {emptyDataTableFocus} from "../focus/DataTableFocus";
    import {gettableWritable} from "../editors/GettableWritable";
    import {makeFocusControls} from "./makeFocusControls";
    import {onDestroy} from "svelte";
    import type {LoadingState} from "./RecordsContext";
    import {backend, getRecordsForModel} from "../appBackend";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {eventSourcedDataRecordsStore} from "./EventSourcedDataRecordsStore";
    import {makeRecordControls} from "./makeRecordControls";
    import {currentUserId} from "../stores/currentUserId";
    import {makeModelControls} from "./makeModelControls";
    import type {ErrorVisibilityByRecordId} from "./helpers";
    import {emptyFilterParams, type FilterParams, type RecordSaver} from "../backend/Backend";
    import {dataRecordFns} from "@cozemble/model-api";
    import type {NestedModelId} from "@cozemble/model-core";

    const systemConfigurationProvider = () => $systemConfiguration
    const modelsProvider = () => $allModels

    export let modelId: ModelId
    export let recordLoader: (modelId: ModelId, filterParams: FilterParams) => Promise<DataRecord[]> = getRecordsForModel
    export let eventSourcedRecords = eventSourcedDataRecordsStore(systemConfigurationProvider, modelsProvider, () => $model, $currentUserId)
    export let recordSaver: RecordSaver = backend
    export let oneOnly = false
    export let permitRecordAdditions = true

    const eventSourcedModel = derived(allEventSourcedModels, models => eventSourcedModelFns.findById(models, modelId))
    const model = derived(eventSourcedModel, model => model.model)
    const records = derived(eventSourcedRecords, records => records.map(record => record.record))
    const errorVisibilityByRecordId = gettableWritable(new Map() as ErrorVisibilityByRecordId)
    const focus = gettableWritable(emptyDataTableFocus(() => eventSourcedRecords.get().map((r) => r.record)))
    const focusControls = makeFocusControls(modelsProvider, () => $records, systemConfigurationProvider, focus)
    const lastSavedByRecordId = writable(new Map<string, number>())
    const dirtyRecords = derived([eventSourcedRecords, lastSavedByRecordId], ([records, lastSavedByRecordId]) => {
        return records
            .filter((r) => {
                const lastSaved = lastSavedByRecordId.get(r.record.id.value) ?? 0
                return r.events.some((e) => e.timestamp.value > lastSaved)
            })
            .map((r) => r.record.id)
    })
    const loadingState = writable('loading' as LoadingState)
    const filterParams = writable(emptyFilterParams())
    let debounceTimeout: any

    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setEventSourcedRecords(eventSourcedRecords)
    modelRecordsContextFns.setRecords(records)
    modelRecordsContextFns.setFocus(focus)
    modelRecordsContextFns.setFocusControls(focusControls)
    modelRecordsContextFns.setDirtyRecords(dirtyRecords)
    modelRecordsContextFns.setRecordControls(makeRecordControls(systemConfigurationProvider, recordSaver, modelsProvider, errorVisibilityByRecordId, eventSourcedRecords, lastSavedByRecordId))
    modelRecordsContextFns.setModelControls(makeModelControls(allEventSourcedModels))
    modelRecordsContextFns.setErrorVisibilityByRecordId(errorVisibilityByRecordId)
    modelRecordsContextFns.setFilterParams(filterParams)
    modelRecordsContextFns.setNestedModelBeingEdited(writable(null as NestedModelId|null))
    modelRecordsContextFns.setPermitRecordAdditions(writable(permitRecordAdditions))

    let someRecordsLoaded = false

    const unsubAllEventSourcedModels = allModels.subscribe(models => {
        eventSourcedRecords.update(records => {
            return records.map(r => ({...r, models}))
        })
    })

    function newEmptyRecord(model: Model) {
        return eventSourcedDataRecordFns.fromRecord($allModels, dataRecordFns.newInstance($model, $currentUserId))
    }

    async function loadRecords(filterParams: FilterParams) {
        loadingState.set('loading')
        const loaded = await recordLoader(modelId, filterParams)
        if (oneOnly) {
            eventSourcedRecords.set(
                [...loaded.map((r) => eventSourcedDataRecordFns.fromRecord($allModels, r))],
            )
        } else {
            eventSourcedRecords.set(
                [...loaded.map((r) => eventSourcedDataRecordFns.fromRecord($allModels, r)), newEmptyRecord($model)],
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