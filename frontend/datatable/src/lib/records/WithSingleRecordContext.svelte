<script lang="ts">
    import type {DataRecordId} from "@cozemble/model-core";
    import {makeCombinedDataRecordEditorClient} from "./makeCombinedDataRecordEditorClient";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {derived} from "svelte/store";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {allModels} from "../stores/allModels";
    import {modelFns} from "@cozemble/model-api";
    import {allModelViews} from "../stores/allModelViews";
    import {backend} from "../appBackend";
    import {singleRecordEditContext} from "./contextHelper";

    export let recordId: DataRecordId
    export let rowIndex: number
    const records = modelRecordsContextFns.getRecords()
    const errorVisibilityByRecordId = modelRecordsContextFns.getErrorVisibilityByRecordId()

    // const maybeExistingEditor = getContext(recordEditorClientContext)
    const maybeExistingEditor = singleRecordEditContext.optionalRecordEditorClient()
    if (!maybeExistingEditor) {
        const records = modelRecordsContextFns.getEventSourcedRecords()
        const modelViewsProvider = () => $allModelViews
        const modelsProvider = () => $allModels
        const combinedClient = makeCombinedDataRecordEditorClient(backend, modelsProvider, modelViewsProvider, records, modelRecordsContextFns.getFocusControls(), recordId)
        singleRecordEditContext.setCombinedClient(combinedClient)
    }

    let rootRecordIndex = singleRecordEditContext.optionalRootRecordIndex()
    if (rootRecordIndex === null) {
        rootRecordIndex = rowIndex
        singleRecordEditContext.setRootRecordIndex(rootRecordIndex)
    }
    let maybeExistingErrorsForRecord = singleRecordEditContext.optionalErrorsForRecord()
    if (!maybeExistingErrorsForRecord) {
        const errors = derived([records, allModels, systemConfiguration], ([records, models, systemConfiguration]) => {
            const maybeRecord = records.find(r => r.id.value === recordId.value)
            if (maybeRecord) {
                return modelFns.validate(systemConfiguration, models, maybeRecord)
            }
            return new Map()
        })
        singleRecordEditContext.setErrorsForRecord(errors)
    }
    const maybeExistingErrorVisibility = singleRecordEditContext.optionalErrorVisibilityForRecord()
    if (!maybeExistingErrorVisibility) {
        const errorVisibility = derived(errorVisibilityByRecordId, errorVisibilityByRecordId => {
            return errorVisibilityByRecordId.get(recordId.value) ?? false
        })
        singleRecordEditContext.setErrorVisibilityForRecord(errorVisibility)
    }
</script>
<slot {rootRecordIndex}></slot>