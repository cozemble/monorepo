<script lang="ts">
    import type {CreateNewRecord} from "./recordCreatorStore";
    import {createNewRecordStore} from "./recordCreatorStore";
    import {allModels} from "../../stores/allModels";
    import {dataRecordFns, modelFns} from "@cozemble/model-api";
    import {currentUserId} from "../../stores/currentUserId";
    import ModelRecordsContext from "../ModelRecordsContext.svelte";
    import type {DataRecord} from "@cozemble/model-core";
    import {eventSourcedDataRecordsStore} from "../EventSourcedDataRecordsStore";
    import {systemConfiguration} from "../../stores/systemConfiguration";
    import {derived} from "svelte/store";
    import WithSingleRecordContext from "../../records/WithSingleRecordContext.svelte";
    import SingleRootRecordEditTable from "./SingleRootRecordEditTable.svelte";

    export let params: CreateNewRecord
    const model = modelFns.findById($allModels, params.modelId)
    const eventSourcedRecords = eventSourcedDataRecordsStore(() => $systemConfiguration, () => $allModels, () => model, $currentUserId)
    const records = derived(eventSourcedRecords, esdrs => esdrs.map(esdr => esdr.record))

    async function recordLoader(): Promise<DataRecord[]> {
        return [dataRecordFns.newInstance(model, $currentUserId)]
    }

    function cancel() {
        params.onCancel()
        createNewRecordStore.update(() => null)
    }

    function save(record: DataRecord) {
        params.onCreated(record)
        createNewRecordStore.update(() => null)
    }
</script>

<ModelRecordsContext modelId={model.id} {recordLoader} {eventSourcedRecords} oneOnly={true}>
    {#each $records as record, rowIndex}
        <WithSingleRecordContext recordId={record.id} {rowIndex}>
            <div class="mt-2">
                <h4>Create a new {model.name.value}</h4>
                <SingleRootRecordEditTable {model} {record} {save} {cancel}/>
            </div>
        </WithSingleRecordContext>
    {/each}
</ModelRecordsContext>
