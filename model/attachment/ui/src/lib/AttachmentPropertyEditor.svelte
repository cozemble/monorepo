<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import type {AttachmentList} from "@cozemble/model-attachment-core";
    import type {AttachmentReference} from "@cozemble/model-attachment-core";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk/dist/esm";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    let error: string | null = null
    let uploadProgress = 0

    const dataRecordEditorClient = dataRecordEditor.getClient()

    const attachments = dataRecordPathFns.getValue(recordPath, record) as AttachmentList ?? ({
        _type: 'attachment.list',
        attachmentReferences: []
    })


    function uploadProgressUpdate(percentage: number) {
        console.log("Upload progress:", percentage)
        uploadProgress = percentage
    }

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const fileList = target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        try {
            const uploaded = await dataRecordEditorClient.uploadAttachments(Array.from(fileList), uploadProgressUpdate)
            const newAttachmentRefs: AttachmentReference[] = uploaded.map(ul => ({
                _type: 'attachment.reference',
                attachmentId: ul.attachmentId,
                fileName: ul.file.name,
                contentType: ul.file.type,
                sizeInBytes: ul.file.size,
                size: null,
                thumbnailUrl: ul.thumbnailUrl
            }))
            const newAttachments = {
                ...attachments,
                attachmentReferences: [...attachments.attachmentReferences, ...newAttachmentRefs]
            }
            console.log({files: fileList, uploaded, newAttachments})
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    attachments,
                    newAttachments,
                    null,
                ),
            )

        } catch (e: any) {
            error = e.message
        }
    }
</script>

<style>
    .progress {
        background-color: #f3f3f3;
        border-radius: 5px;
        height: 20px;
        width: 100%;
        max-width: 250px;
        overflow: hidden;
    }

    .progress-bar {
        background-color: #4caf50;
        height: 100%;
        transition: width 0.4s ease;
    }
</style>

<input type="file" accept="*/*" class="file-input file-input-bordered file-input-xs w-full max-w-xs"
       on:change={handleFileSelect}/>

{#if uploadProgress > 0 && uploadProgress < 100}
    <div class="progress">
        <div class="progress-bar" style="width: {uploadProgress}%"></div>
    </div>
{/if}

{#if error}
    <div class="alert alert-error shadow-lg">
        <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
                 viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <span>{error}</span>
        </div>
    </div>
{/if}
