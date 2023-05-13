<script lang="ts">
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import type {DataRecord, DataRecordPathParentElement, ModelId, NestedModel} from "@cozemble/model-core";
    import DataRecordsTableInContext from "./DataRecordsTableInContext.svelte";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {derived} from "svelte/store";
    import {mandatory} from "@cozemble/lang-util";
    import WithNestedRecordsContext from "./WithNestedRecordsContext.svelte";
    import {allEventSourcedModels} from "../stores/allModels";
    import {dataRecordFns} from "@cozemble/model-api";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";
    import {singleRecordEditContext} from "./contextHelper";
    import {createNewNestedRecord} from "./creator/recordCreatorStore";
    import NestedModelName from "$lib/records/NestedModelName.svelte";

    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let nestedModel: NestedModel
    export let parentPath: DataRecordPathParentElement[]
    export let parentModelId: ModelId
    const nestedParentPath = [...parentPath, nestedModel]
    const eventSourcedModel = derived(allEventSourcedModels, allModels => mandatory(eventSourcedModelFns.findById(allModels, nestedModel.modelId), `No model found for ${nestedModel.modelId.value}`))
    const model = derived(eventSourcedModel, esm => esm.model)
    const oneOnly = nestedModel.cardinality === 'one'
    const records = modelRecordsContextFns.getRecords()
    const rootRecordEditorClient = singleRecordEditContext.getRecordEditorClient()
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
        const newRecord = await createNewNestedRecord($model.id, '')
        if (newRecord) {
            rootRecordEditorClient.dispatchEditEvent(dataRecordEditEvents.hasManyItemAdded(record, parentPath, nestedModel, newRecord.record))
        }
    }


</script>

<WithNestedRecordsContext records={nestedRecords} {eventSourcedModel} {model}>
    <div class="mb-2">
        <NestedModelName model={$model} {nestedModel}/>
    </div>
    <DataRecordsTableInContext {options} {oneOnly} parentPath={nestedParentPath}/>
    <div class="mt-2">
        {#if !oneOnly && $model.slots.length > 0}
            <button class="btn btn-primary btn-sm add-nested-item" on:click={addRecord}>
                Add {$model.name.value}</button>
        {/if}
    </div>
</WithNestedRecordsContext>