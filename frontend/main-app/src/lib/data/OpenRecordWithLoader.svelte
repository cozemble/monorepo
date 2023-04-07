<script lang="ts">
    import type {DataRecord, DataRecordId, Model, ModelId} from "@cozemble/model-core";
    import type {OpenRecordView} from "./openRecordViews";
    import {openRecordViews} from "./openRecordViews";
    import {onMount} from "svelte";
    import {findRecordById, loadRecords} from "./loadRecords";
    import type {AttachmentsManager, RecordSaveOutcome, RecordSearcher} from "@cozemble/data-paginated-editor";
    import {RecordEditContext, StackingRecordEditor} from "@cozemble/data-paginated-editor";
    import {modelViews} from "../models/tenantEntityStore";
    import {saveRecord} from "./recordBackendHelper";
    import type {AttachmentIdAndFileName, EventSourcedDataRecord, UploadedAttachment} from "@cozemble/data-editor-sdk";
    import {dataRecordViewerHost, eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";
    import {makeDataRecordViewer} from "./makeDataRecordViewer";
    import {
        deleteAttachments as deleteAttachmentsFn,
        getAttachmentViewUrls as getAttachmentViewUrlsFn,
        uploadAttachments as uploadAttachmentsFn
    } from "./attachments";
    import {modelFns} from "@cozemble/model-api";
    import InboundReferences from "./InboundReferences.svelte";

    export let models: Model[]
    export let openRecord: OpenRecordView //a Customer record for example
    export let tenantId: string
    let record: DataRecord | null = null
    let error: string | null = null
    const model = modelFns.findById(models, openRecord.modelId)
    const referencingModels: Model[] = modelFns.findInboundReferences(models, model) //the Booking model for example
    let tabShowing: string | ModelId = 'recordDetails'

    onMount(async () => {
        record = await findRecordById(tenantId, openRecord.modelId, openRecord.recordId)
    })

    async function onSaveRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
        return saveRecord(tenantId, models,newRecord)
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
            return uploadAttachmentsFn(tenantId, files, progressUpdater)
        },

        async deleteAttachments(attachmentIds: string[]): Promise<void> {
            return deleteAttachmentsFn(tenantId, attachmentIds)
        },

        async getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]> {
            return getAttachmentViewUrlsFn(tenantId, attachments)
        }
    }

    function closeView() {
        openRecordViews.close(openRecord.recordId)
    }

    dataRecordViewerHost.setClient(makeDataRecordViewer(models, $modelViews, recordSearcher, attachmentsManager, onSaveRecord, onError))

    function onError(e: Error) {
        error = e.message
    }

    function showTab(tab: string | ModelId) {
        tabShowing = tab
    }

    function modelIdShowing(): ModelId {
        if (typeof tabShowing === 'string') {
            throw new Error('Not showing a model')
        } else {
            return tabShowing
        }
    }
</script>

<div class="mt-3">
    <div class="tabs">
        <a class="tab tab-lifted" class:tab-active={tabShowing ==='recordDetails'}
           on:click={() => showTab('recordDetails')}>{model.name.value} details</a>
        {#each referencingModels as referencingModel}
            <a class="tab tab-lifted"
               class:tab-active={tabShowing === referencingModel.id.value}
               on:click={() => showTab(referencingModel.id)}>{referencingModel.name.value}</a>
        {/each}
    </div>
    {#if tabShowing === 'recordDetails'}
        {#if record}
            <StackingRecordEditor {recordSearcher} modelViews={$modelViews} {attachmentsManager}
                                  recordEditContext={new RecordEditContext( models, onSaveRecord,eventSourcedDataRecordFns.fromRecord(models, record), onSaveRecord, closeView, `` )}
                                  cancelButtonText="Close"/>
        {/if}
    {:else}
        {#key tabShowing}
            {#if record}
                <InboundReferences {tenantId} {models} referencingModelId={modelIdShowing()} {record}/>
            {/if}
        {/key}
    {/if}
</div>

{#if error}
    <div class="alert alert-danger" role="alert">
        {error}
    </div>
{/if}