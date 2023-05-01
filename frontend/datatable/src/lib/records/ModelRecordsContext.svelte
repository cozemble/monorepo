<script lang="ts">
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {derived, writable} from "svelte/store";
    import type {DataRecordId, ModelId} from "@cozemble/model-core";
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

    export let modelId: ModelId;
    const eventSourcedModel = derived(allEventSourcedModels, models => eventSourcedModelFns.findById(models, modelId))
    const model = derived(eventSourcedModel, model => model.model)
    const eventSourcedRecords = eventSourcedDataRecordsStore(() => $systemConfiguration)
    const records = derived(eventSourcedRecords, records => records.map(record => record.record))
    const focus = gettableWritable(emptyDataTableFocus(() => eventSourcedRecords.get().map((r) => r.record)))
    const lastSaved = writable(new Date().getTime())
    const dirtyRecords = writable([] as DataRecordId[])
    const loadingState = writable('loading' as LoadingState)

    modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
    modelRecordsContextFns.setModel(model)
    modelRecordsContextFns.setEventSourcedRecords(eventSourcedRecords)
    modelRecordsContextFns.setRecords(records)
    modelRecordsContextFns.setFocus(focus)
    modelRecordsContextFns.setFocusControls(makeFocusControls(() => $allModels, () => $records, () => $systemConfiguration, focus))
    modelRecordsContextFns.setDirtyRecords(dirtyRecords)

    onMount(async () => {
        loadingState.set('loading')
        const loaded = await getRecordsForModel(modelId)
        eventSourcedRecords.set(
            loaded.map((r) => eventSourcedDataRecordFns.fromRecord($allModels, r)),
        )
        loadingState.set('loaded')
    })
</script>
<DataRecordEditorContext>
    <slot></slot>
</DataRecordEditorContext>