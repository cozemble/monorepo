<script lang="ts">
    import type {PageData} from './$types'
    import {page} from '$app/stores';
    import DataPanelInner from "../../../../../lib/data/DataPanelInner.svelte";
    import type {RecordDeleteOutcome, RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {type PaginatedEditorHost, recordSaveSucceeded} from "@cozemble/data-paginated-editor";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import type {DataRecord} from "@cozemble/model-core";
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers
    } from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import type {Model} from "@cozemble/model-core";
    import type {BackendModel} from "@cozemble/backend-tenanted-api-types";

    export let data: PageData

    $:records = data.records?.records.records ?? []
    $:count = data.records?.records?.count ?? 0
    $:totalPages = data.records?.records?.totalPages ?? 0
    $:models = (data.tenant?.models ?? []).map((m:BackendModel) => m.definition) as Model[]
    $:model = models.find(m => m.id.value === $page.params.modelId)

    const paginatedEditorHost: PaginatedEditorHost = {
        async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            console.log("recordEdited", editedRecord)
            return recordSaveSucceeded(editedRecord.record)
        },

        async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            console.log("saveNewRecord", newRecord)
            return recordSaveSucceeded(newRecord.record)
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            console.log("deleteRecord", record)
            return recordSaveSucceeded(record)
        },
    }

    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()

    })

</script>

{#if model}
    <DataPanelInner {models} {model} {records} {paginatedEditorHost}/>
{/if}