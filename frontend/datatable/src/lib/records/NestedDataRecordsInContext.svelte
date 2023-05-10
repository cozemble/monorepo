<script lang="ts">
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import type {DataRecord, DataRecordPathParentElement, NestedModel} from "@cozemble/model-core";
    import DataRecordsTableInContext from "./DataRecordsTableInContext.svelte";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {derived} from "svelte/store";
    import {mandatory} from "@cozemble/lang-util";
    import WithNestedRecordsContext from "./WithNestedRecordsContext.svelte";
    import {allEventSourcedModels, allModels} from "../stores/allModels";
    import {dataRecordFns} from "@cozemble/model-api";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {getContext, tick} from "svelte";
    import {modelFns} from "@cozemble/model-api/dist/esm";
    import type {DataRecordEditorClient} from "@cozemble/data-editor-sdk";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";
    import {currentUserId} from "../stores/currentUserId";
    import {singleRecordEditContext} from "./contextHelper";

    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let nestedModel: NestedModel
    export let parentPath: DataRecordPathParentElement[]
    const nestedParentPath = [...parentPath, nestedModel]
    const eventSourcedModel = derived(allEventSourcedModels, allModels => mandatory(eventSourcedModelFns.findById(allModels, nestedModel.modelId), `No model found for ${nestedModel.modelId.value}`))
    const model = derived(eventSourcedModel, esm => esm.model)
    const oneOnly = nestedModel.cardinality === 'one'
    const records = modelRecordsContextFns.getRecords()
    const rootRecordEditorClient = singleRecordEditContext.getRecordEditorClient()
    const actualNestedModel = modelFns.findById($allModels, nestedModel.modelId)
    const nestedRecords = derived(records, records => {
        const maybeRecordLatest = records.find(r => r.id.value === record.id.value)
        if (!maybeRecordLatest) {
            return []
        }
        const maybeValue = maybeRecordLatest.values[nestedModel.id.value]
        if (maybeValue) {
            if (Array.isArray(maybeValue)) {
                return maybeValue
            }
            return [maybeValue]
        }
        if (oneOnly) {
            return [dataRecordFns.newInstance($model, record.createdBy.value)]
        }
        return []
    })

    async function addRecord() {
        rootRecordEditorClient.dispatchEditEvent(dataRecordEditEvents.hasManyItemAdded(record,parentPath, nestedModel, dataRecordFns.newInstance(actualNestedModel, $currentUserId)))
        // recordControls.addNewRecord()
        // await tick()
        // const lastRowIndex = $records.length - 1
        // const firstEditableSlot = modelFns.leafSlots($model)[0]
        // if (firstEditableSlot) {
        //     focusControls.setFocus(lastRowIndex, firstEditableSlot, [])
        //     focusControls.beginEditing()
        // }
    }

</script>

<WithNestedRecordsContext records={nestedRecords} {eventSourcedModel} {model}>
    <h6 class="mb-2">{nestedModel.name.value}</h6>
    <DataRecordsTableInContext {options} {oneOnly} parentPath={nestedParentPath}/>
    <div class="mt-2">
        {#if !oneOnly && $model.slots.length > 0}
            <button class="btn btn-primary" on:click={addRecord}>
                Add {$model.name.value}</button>
        {/if}
    </div>

</WithNestedRecordsContext>
