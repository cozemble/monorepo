<script lang="ts">
    import type {DataRecord, Model} from "@cozemble/model-core";
    import type {PaginatedEditorHost, RecordDeleteOutcome, RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {PaginatedEditor} from "@cozemble/data-paginated-editor";
    import type {Writable} from "svelte/store";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {deleteRecord, saveRecord} from "./recordBackendHelper";
    import {createEventDispatcher} from "svelte";

    export let models: Model[]
    export let model: Model
    export let tenantId: string
    export let records: Writable<DataRecord[]>

    console.log({models, model, tenantId, records:$records})

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
            const result = await deleteRecord(tenantId, model.id.value, record)
            if (result._type === "record.save.succeeded") {
                records.update(r => r.filter(r => r.id.value !== record.id.value))
            }
            return result
        },
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
    <input type="text" placeholder="Search" on:keyup={searchTextChanged} bind:value={searchText}/>
</div>
<PaginatedEditor {models} {model} records={$records} {paginatedEditorHost}/>

<style>
    .search-panel {
        margin-top: 0.5rem;
    }
</style>