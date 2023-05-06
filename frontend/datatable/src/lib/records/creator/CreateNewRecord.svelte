<script lang="ts">
    import type {CreateNewRecord} from "./recordCreatorStore";
    import {createNewRecordStore} from "./recordCreatorStore";
    import {allModels} from "../../stores/allModels";
    import {dataRecordFns, modelFns} from "@cozemble/model-api";
    import {currentUserId} from "../../stores/currentUserId";
    import ModelRecordsContext from "../ModelRecordsContext.svelte";
    import type {DataRecord} from "@cozemble/model-core";
    import DataRecordsTableInContext from "../DataRecordsTableInContext.svelte";
    import {eventSourcedDataRecordsStore} from "../EventSourcedDataRecordsStore";
    import {systemConfiguration} from "../../stores/systemConfiguration";
    import {afterUpdate} from "svelte";
    import {derived} from "svelte/store";
    import {dataRecordsTableOptions} from "../DataRecordsTableOptions";
    import type {RecordSaver} from "../../backend/Backend";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import type {RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {backend} from "../../appBackend";

    export let params: CreateNewRecord
    const model = modelFns.findById($allModels, params.modelId)
    const record = dataRecordFns.newInstance(model, $currentUserId)
    const eventSourcedRecords = eventSourcedDataRecordsStore(() => $systemConfiguration, () => $allModels, () => model, $currentUserId)
    const latestRecord = derived(eventSourcedRecords, $eventSourcedRecords => $eventSourcedRecords[0])
    const errors = derived(latestRecord, r => r?.record ? modelFns.validate($systemConfiguration, $allModels, r.record) : new Map())

    async function recordLoader(): Promise<DataRecord[]> {
        return [record]
    }

    function cancel() {
        params.onCancel()
        createNewRecordStore.update(() => null)
    }

    const recordSaver: RecordSaver = {
        async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const outcome = await backend.saveNewRecord(newRecord)
            if(outcome._type === "record.save.succeeded") {
                params.onCreated(outcome.record)
                createNewRecordStore.update(() => null)
            }
            return outcome
        },

        async saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            return this.saveNewRecord(record)
        }
    }

    afterUpdate(() => {
        console.log({latestRecord: $latestRecord, errors: $errors})
    })
</script>
<ModelRecordsContext modelId={model.id} {recordLoader} {eventSourcedRecords} {recordSaver}>
    <div class="mt-2">
        <h4>Create a new {model.name.value}</h4>
        <DataRecordsTableInContext oneOnly={true} options={dataRecordsTableOptions(false, false, true)}/>
    </div>
</ModelRecordsContext>