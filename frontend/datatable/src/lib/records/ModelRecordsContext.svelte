<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {derived, writable} from "svelte/store";
    import type {ModelId} from "@cozemble/model-core";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";
    import {emptyDataTableFocus} from "../focus/DataTableFocus";
    import {gettableWritable} from "../editors/GettableWritable";
    import {makeFocusControls} from "./makeFocusControls";
    import {onMount} from "svelte";
    import type {LoadingState} from "./RecordsContext";
    import {getRecordsForModel} from "../appBackend";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import DataRecordEditorContext from "./DataRecordEditorContext.svelte";
    import {eventSourcedDataRecordsStore} from "./EventSourcedDataRecordsStore";
    import {makeRecordControls} from "./makeRecordControls";
    import {currentUserId} from "../stores/currentUserId";
    import {makeModelControls} from "./makeModelControls";
    import {onDestroy} from "svelte";

    export let modelId: ModelId;
    const eventSourcedModel = derived(allEventSourcedModels, models => eventSourcedModelFns.findById(models, modelId))
    const model = derived(eventSourcedModel, model => model.model)
    const eventSourcedRecords = eventSourcedDataRecordsStore(() => $systemConfiguration, () => $allModels, () => $model, $currentUserId)
    const records = derived(eventSourcedRecords, records => records.map(record => record.record))
    const focus = gettableWritable(emptyDataTableFocus(() => eventSourcedRecords.get().map((r) => r.record)))
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

    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setEventSourcedRecords(eventSourcedRecords)
    modelRecordsContextFns.setRecords(records)
    modelRecordsContextFns.setFocus(focus)
    modelRecordsContextFns.setFocusControls(makeFocusControls(() => $allModels, () => $records, () => $systemConfiguration, focus))
    modelRecordsContextFns.setDirtyRecords(dirtyRecords)
    modelRecordsContextFns.setRecordControls(makeRecordControls(eventSourcedRecords, lastSavedByRecordId))
    modelRecordsContextFns.setModelControls(makeModelControls(allEventSourcedModels))

    onMount(async () => {
        loadingState.set('loading')
        const loaded = await getRecordsForModel(modelId)
        eventSourcedRecords.set(
            loaded.map((r) => eventSourcedDataRecordFns.fromRecord($allModels, r)),
        )
        loadingState.set('loaded')
    })

    const unsubAllEventSourcedModels = allModels.subscribe(models => {
        eventSourcedRecords.update(records => {
            return records.map(r => ({...r, models}))
        })
    })

    onDestroy(() => {
        unsubAllEventSourcedModels()
    })
</script>
<DataRecordEditorContext>
    <slot></slot>
</DataRecordEditorContext>