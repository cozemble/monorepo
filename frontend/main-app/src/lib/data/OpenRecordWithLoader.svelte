<script lang="ts">
    import type {DataRecord, DataRecordId, Model, ModelId} from "@cozemble/model-core";
    import type {OpenRecordView} from "./openRecordViews";
    import {openRecordViews} from "./openRecordViews";
    import {onMount} from "svelte";
    import {findRecordById, loadRecords} from "./loadRecords";
    import type {RecordSaveOutcome, RecordSearcher} from "@cozemble/data-paginated-editor";
    import {RecordEditContext, StackingRecordEditor} from "@cozemble/data-paginated-editor";
    import {modelViews} from "../models/tenantEntityStore";
    import {saveRecord} from "./recordBackendHelper";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";
    import type {AttachmentsManager} from "@cozemble/data-paginated-editor/src/lib/AttachmentsManager";
    import type {UploadedAttachment} from "@cozemble/data-editor-sdk";

    export let models: Model[]
    export let openRecord: OpenRecordView
    export let tenantId: string
    let record: DataRecord | null = null


    onMount(async () => {
        record = await findRecordById(tenantId, openRecord.modelId, openRecord.recordId)
    })

    async function onSaveRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
        return saveRecord(tenantId, newRecord)
    }

    const recordSearcher: RecordSearcher = {
        async searchRecords(modelId: ModelId, searchText: string): Promise<DataRecord[]> {
            const result = await loadRecords(tenantId, modelId.value, searchText.trim().length === 0 ? null : searchText)
            return result.records
        },

        async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
            return findRecordById(tenantId, modelId, recordId)
        }
    }

    const attachmentsManager: AttachmentsManager = {
        async uploadAttachments(
            files: File[],
            progressUpdater: (percent: number) => void,
        ): Promise<UploadedAttachment[]> {
            throw new Error("Not implemented")
        }
    }

    function closeView() {
        openRecordViews.close(openRecord.recordId)
    }

</script>
{#if record}
    <div class="mt-3">
        <StackingRecordEditor {recordSearcher} modelViews={$modelViews} {attachmentsManager}
                              recordEditContext={new RecordEditContext( models, onSaveRecord,eventSourcedDataRecordFns.fromRecord(models, record), onSaveRecord, closeView, `` )}
                              cancelButtonText="Close"/>
    </div>
{/if}