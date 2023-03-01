<script lang="ts">
    import type {PageData} from './$types'
    import {page} from '$app/stores';
    import DataPanelInner from "../../../../../lib/data/DataPanelInner.svelte";
    import type {RecordDeleteOutcome, RecordSaveOutcome} from "@cozemble/data-paginated-editor";
    import {type PaginatedEditorHost, recordSaveFailed, recordSaveSucceeded} from "@cozemble/data-paginated-editor";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import type {DataRecord, Model} from "@cozemble/model-core";
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers
    } from "@cozemble/model-assembled";
    import {onMount} from "svelte";
    import {writable, type Writable} from "svelte/store";
    import type {BackendModel} from "@cozemble/backend-tenanted-api-types";
    import {config} from "../../../../../lib/config";

    export let data: PageData
    const records: Writable<DataRecord[]> = writable([])

    $:count = data.records?.records?.count ?? 0
    $:totalPages = data.records?.records?.totalPages ?? 0
    $:models = (data.tenant?.models ?? []).map((m: BackendModel) => m.definition) as Model[]
    $:model = models.find(m => m.id.value === $page.params.modelId)

    async function saveRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
        const tenantId = $page.params.tenantId
        const modelId = $page.params.modelId
        const saveResponse = await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify([newRecord.record])
        })
        if (saveResponse.ok) {
            return recordSaveSucceeded(newRecord.record)
        } else {
            return recordSaveFailed([saveResponse.statusText], new Map())
        }
    }

    const paginatedEditorHost: PaginatedEditorHost = {
        async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result =  await saveRecord(editedRecord)
            if(result._type === "record.save.succeeded") {
                records.update(r => r.map(r => r.id.value === editedRecord.record.id.value ? editedRecord.record : r))
            }
            return result
        },

        async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
            const result = await saveRecord(newRecord)
            if(result._type === "record.save.succeeded") {
                records.update(r => [...r, newRecord.record])
            }
            return result
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            console.log("deleteRecord", record)
            return recordSaveSucceeded(record)
        },
    }

    let mounted = false
    onMount(() => {
        records.set(data.records?.records ?? [])
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        mounted = true
    })

</script>

{#if model && mounted}
    <DataPanelInner {models} {model} records={$records} {paginatedEditorHost}/>
{/if}