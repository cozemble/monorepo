<script lang="ts">
    import DataRecordEditor from './DataRecordEditor.svelte'
    import type {
        AttachmentIdAndFileName,
        DataRecordControlEvent,
        DataRecordEditEvent,
        DataRecordEditorClient,
        ModelViewManager,
        UserInstruction,
    } from '@cozemble/data-editor-sdk'
    import {dataRecordEditorHost, type UploadedAttachment} from '@cozemble/data-editor-sdk'
    import type {RecordEditContext} from './RecordEditContext'
    import {getEditRecordListener} from './EditRecordListener'
    import {getContext, onDestroy, onMount} from 'svelte'
    import type {DataRecord, Model, ModelId, ModelView} from "@cozemble/model-core";
    import type {RecordSearcher} from "./RecordSearcher";
    import type {RecordCreator} from "./RecordCreator";
    import type {AttachmentsManager} from "./AttachmentsManager";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import {strings} from "@cozemble/lang-util";
    import type {DataRecordId} from "@cozemble/model-core";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let recordCreator: RecordCreator
    export let attachmentsManager: AttachmentsManager
    export let modelViewManager: ModelViewManager
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void
    export let cancelButtonText = "Cancel"

    const editListener = getEditRecordListener(getContext)

    function handleCancel() {
        recordEditContext.cancel()
    }

    async function handleSave() {
        await recordEditContext.attemptSave()
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
            return recordSearcher.recordById(modelId, recordId)
        },

        createNewRootRecord(modelId: ModelId): Promise<DataRecord | null> {
            return recordCreator.createNewRecord(modelId)
        },

        dispatchEditEvent(event: DataRecordEditEvent): void {
            editListener.onEvent(recordEditContext, event)
            recordEditContext.handleDataRecordEditEvent(event)
        },
        dispatchControlEvent(event: DataRecordControlEvent): void {
            recordEditContext.handleDataRecordControlEvent(event)
        },
        searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
            return recordSearcher.searchRecords(modelId, search)
        },
        getModelViews(modelId: ModelId): ModelView[] {
            return modelViewManager.getModelViews(modelId)
        },
        saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
            return modelViewManager.saveModelView(modelView)
        },
        getModels(): Model[] {
            return recordEditContext.models
        },
        uploadAttachments(
            files: File[],
            progressUpdater: (percent: number) => void,
        ): Promise<UploadedAttachment[]> {
            return attachmentsManager.uploadAttachments(files, progressUpdater)
        },
        deleteAttachments(attachmentIds: string[]): Promise<void> {
            return attachmentsManager.deleteAttachments(attachmentIds)
        },

        getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
            return attachmentsManager.getAttachmentViewUrls(attachmentIds)
        },

        instructUser(_userInstruction: UserInstruction): void {
            throw new Error("Not implemented")
        },
    }

    dataRecordEditorHost.setClient(dataRecordEditorClient)

    onMount(() => {
        editListener.beginEdit(recordEditContext)
    })
    onDestroy(() => {
        editListener.popEdit()
    })
</script>

<DataRecordEditor {recordEditContext} {pushContext} {popContext}/>

<br/>
<div class="buttons my-4 flex">
    <button type="button" class="btn btn-primary save save-{strings.camelize(recordEditContext.model.name.value)}"
            on:click={handleSave}>Save
    </button>
    <button type="button"
            class="btn btn-error ml-2 cancel cancel-{strings.camelize(recordEditContext.model.name.value)}"
            on:click={handleCancel}>{cancelButtonText}</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>
