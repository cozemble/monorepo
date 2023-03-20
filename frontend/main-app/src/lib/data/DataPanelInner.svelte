<script lang="ts">
    import type {DataRecord, DataRecordId, Model, ModelId} from "@cozemble/model-core";
    import type {PaginatedEditorHost, RecordDeleteOutcome, RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";
    import type {Writable} from "svelte/store";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {deleteRecord, saveRecord} from "./recordBackendHelper";
    import {createEventDispatcher} from "svelte";
    import {findRecordById, loadRecords} from "./loadRecords";
    import {modelViews} from "../models/tenantEntityStore";
    import {openRecordViews} from "./openRecordViews";

    export let models: Model[]
    export let model: Model
    export let tenantId: string
    export let records: Writable<DataRecord[]>

    const paginatedEditorHost: PaginatedEditorHost = {
        viewRecord(record: DataRecord, openNow: boolean): void {
            openRecordViews.open(record.modelId, record.id, openNow)
        },
        async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result = await saveRecord(tenantId,  editedRecord)
            if (result._type === "record.save.succeeded") {
                records.update(r => r.map(r => r.id.value === editedRecord.record.id.value ? editedRecord.record : r))
            }
            return result
        },

        async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result = await saveRecord(tenantId, newRecord)
            if (result._type === "record.save.succeeded" && newRecord.record.modelId.value === model.id.value) {
                records.update(r => [...r, newRecord.record])
            }
            return result
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            const result = await deleteRecord(tenantId, model.id.value, record)
            if (result._type === "record.save.succeeded") {
                records.update(r => r.filter(r => r.id.value !== record.id.value))
            }
            return result
        },

        async searchRecords(modelId: ModelId, searchText: string): Promise<DataRecord[]> {
            const result = await loadRecords(tenantId, modelId.value, searchText.trim().length === 0 ? null : searchText)
            return result.records
        },

        async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
            return findRecordById(tenantId, modelId, recordId)
        }
    }

    const dispatch = createEventDispatcher()
    let searchText = ""
    let debounceTimeout: any

    function searchTextChanged() {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            dispatch("searchTextChanged", searchText)
        }, 500);
    }
</script>

<div class="search-panel">
    <input type="text" class="input input-bordered" placeholder={`Search ${model.name.value}`}
           on:keyup={searchTextChanged}
           bind:value={searchText}/>
</div>
<div class="mt-2">
    <PaginatedEditor {models} {model} modelViews={$modelViews} records={$records} {paginatedEditorHost}/>
</div>
<style>
    .search-panel {
        margin-top: 0.5rem;
    }
</style>