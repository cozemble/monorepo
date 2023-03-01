<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import type {PaginatedEditorHost, RecordDeleteOutcome, RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {PaginatedEditor, recordSaveSucceeded} from "@cozemble/data-paginated-editor";
    import type {Writable} from "svelte/store";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {saveRecord} from "./saveRecord";

    export let models: Model[]
    export let model: Model
    export let tenantId: string
    export let records: Writable<DataRecord[]>

    const paginatedEditorHost: PaginatedEditorHost = {
        async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result = await saveRecord(tenantId, model.id.value, editedRecord)
            if (result._type === "record.save.succeeded") {
                records.update(r => r.map(r => r.id.value === editedRecord.record.id.value ? editedRecord.record : r))
            }
            return result
        },

        async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result = await saveRecord(tenantId, model.id.value, newRecord)
            if (result._type === "record.save.succeeded") {
                records.update(r => [...r, newRecord.record])
            }
            return result
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            console.log("deleteRecord", record)
            return recordSaveSucceeded(record)
        },
    }
</script>

<PaginatedEditor {models} {model} records={$records} {paginatedEditorHost}/>