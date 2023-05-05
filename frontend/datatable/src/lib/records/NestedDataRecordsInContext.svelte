<script lang="ts">
    import type {DataRecordsTableOptions} from "./DataRecordsTableOptions";
    import type {DataRecord, DataRecordPathParentElement, NestedModel} from "@cozemble/model-core";
    import DataRecordsTableInContext from "./DataRecordsTableInContext.svelte";
    import {modelRecordsContextFns} from "./modelRecordsContextFns";
    import {derived} from "svelte/store";
    import {mandatory} from "@cozemble/lang-util";
    import WithNestedRecordsContext from "./WithNestedRecordsContext.svelte";
    import {allEventSourcedModels} from "../stores/allModels";
    import {dataRecordFns} from "@cozemble/model-api";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";

    export let options: DataRecordsTableOptions
    export let record: DataRecord
    export let nestedModel: NestedModel
    export let parentPath: DataRecordPathParentElement[]
    const eventSourcedModel = derived(allEventSourcedModels, allModels => mandatory(eventSourcedModelFns.findById(allModels, nestedModel.modelId), `No model found for ${nestedModel.modelId.value}`))
    const model = derived(eventSourcedModel, esm => esm.model)
    const oneOnly = nestedModel.cardinality === 'one'
    const records = modelRecordsContextFns.getRecords()
    const nestedRecords = derived(records, records => {
        const maybeRecordLatest = records.find(r => r.id.value === record.id.value)
        if(!maybeRecordLatest) {
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
</script>

<WithNestedRecordsContext records={nestedRecords} {eventSourcedModel} {model}>
    <h6 class="mb-2">{nestedModel.name.value}</h6>
    <DataRecordsTableInContext {options} {oneOnly} parentPath={[...parentPath, nestedModel]}/>
</WithNestedRecordsContext>
