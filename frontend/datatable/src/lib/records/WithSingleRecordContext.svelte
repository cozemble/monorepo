<script lang="ts">
    import type {DataRecord} from "@cozemble/model-core";
    import {getContext, setContext} from "svelte";
    import {makeCombinedDataRecordEditorClient} from "./makeCombinedDataRecordEditorClient";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {derived} from "svelte/store";
    import {
        recordEditorClientContext,
        recordViewerClientContext,
        singleRecordErrorContext,
        singleRecordErrorVisibilityContext,
        singleRecordRootRecordIndexContext
    } from "./contextHelper";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {allModels} from "../stores/allModels";
    import {modelFns} from "@cozemble/model-api";
    import {allModelViews} from "../stores/allModelViews";
    import {backend} from "../appBackend";

    export let record: DataRecord
    export let rowIndex: number
    const records = modelRecordsContextFns.getRecords()
    const errorVisibilityByRecordId = modelRecordsContextFns.getErrorVisibilityByRecordId()

    const maybeExistingEditor = getContext(recordEditorClientContext)
    if (!maybeExistingEditor) {
        const records = modelRecordsContextFns.getEventSourcedRecords()
        const modelViewsProvider = () => $allModelViews
        const modelsProvider = () => $allModels
        const combinedClient = makeCombinedDataRecordEditorClient(backend, modelsProvider, modelViewsProvider, records, modelRecordsContextFns.getFocusControls(), record.id)
        setContext(recordEditorClientContext, combinedClient)
        setContext(recordViewerClientContext, combinedClient)
    }

    let rootRecordIndex = getContext(singleRecordRootRecordIndexContext) as number
    if (rootRecordIndex === undefined) {
        rootRecordIndex = rowIndex
        setContext(singleRecordRootRecordIndexContext, rootRecordIndex)
    }
    let maybeExistingErrorsForRecord = getContext(singleRecordErrorContext)
    if (!maybeExistingErrorsForRecord) {
        const errors = derived([records, allModels, systemConfiguration], ([records, models, systemConfiguration]) => {
            const maybeRecord = records.find(r => r.id.value === record.id.value)
            if (maybeRecord) {
                return modelFns.validate(systemConfiguration, models, maybeRecord)
            }
            return new Map()
        })
        setContext(singleRecordErrorContext, errors)
    }
    const maybeExistingErrorVisibility = getContext(singleRecordErrorVisibilityContext)
    if (!maybeExistingErrorVisibility) {
        const errorVisibility = derived(errorVisibilityByRecordId, errorVisibilityByRecordId => {
            return errorVisibilityByRecordId.get(record.id.value) ?? false
        })
        setContext(singleRecordErrorVisibilityContext, errorVisibility)
    }
</script>
<slot {rootRecordIndex}></slot>