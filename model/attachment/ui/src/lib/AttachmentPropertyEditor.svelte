<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import {dataRecordEditEvents, dataRecordEditor} from "@cozemble/data-editor-sdk";
    import type {AttachmentReference} from "@cozemble/model-attachment-core";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";
    import {afterUpdate} from "svelte";
    import {getAttachments} from "./helpers";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    let error: string | null = null
    let uploadProgress = 0
    let uploading = false
    let selectedAttachments: AttachmentReference[] = []

    const dataRecordEditorClient = dataRecordEditor.getClient()

    $: attachments = getAttachments(systemConfiguration, recordPath, record)

    afterUpdate(() => console.log({attachments, recordPath, record}))

    function toggleSelection(attachment: AttachmentReference) {
        if (selectedAttachments.includes(attachment)) {
            selectedAttachments = selectedAttachments.filter(a => a !== attachment)
        } else {
            selectedAttachments = [...selectedAttachments, attachment]
        }
    }

    function uploadProgressUpdate(percentage: number) {
        uploadProgress = percentage
        if (percentage === 100) {
            uploading = false
        }
    }

    async function handleFileSelect(event: Event) {
        const target = event.target as HTMLInputElement
        const fileList = target.files;
        if (!fileList || fileList.length === 0) {
            return;
        }
        try {
            uploading = true
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
            dataRecordEditorClient.dispatchEditEvent(
                dataRecordEditEvents.valueChanged(
                    record,
                    recordPath,
                    attachments,
                    newAttachments,
                    "Tab",
                ),
            )
            attachments = newAttachments
        } catch (e: any) {
            console.log({e})
            error = e.message
        } finally {
            uploading = false
        }
    }

    function onDeleteAttachments(event: CustomEvent<AttachmentReference[]>) {
        const {detail: attachmentsToDelete} = event
        const remainingAttachmentReferences = attachments.attachmentReferences.filter(a => !attachmentsToDelete.includes(a))
        const newAttachments = ({
            _type: 'attachment.list',
            attachmentReferences: remainingAttachmentReferences
        })
        dataRecordEditorClient.dispatchEditEvent(
            dataRecordEditEvents.valueChanged(
                record,
                recordPath,
                attachments,
                newAttachments,
                "Tab",
            ),
        )

        selectedAttachments = selectedAttachments.filter(a => !attachmentsToDelete.includes(a))
        dataRecordEditorClient.deleteAttachments(attachmentsToDelete.map(a => a.attachmentId))
    }

</script>

{#if attachments && attachments.attachmentReferences.length > 0}
    <ShowAttachmentThumbs attachments={attachments.attachmentReferences}/>
{:else}
    <p>----</p>
{/if}

<div class="upload-container border p-4 rounded bg-base-100">
    {#if uploading}
        <div class="progress">
            <div class="progress-bar" style="width: {uploadProgress}%"></div>
        </div>
    {:else}
        <input type="file" accept="*/*" class="file-input file-input-bordered file-input-xs w-full max-w-xs"
               on:change={handleFileSelect}/>
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
</div>
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

    .attachment-container {
        display: inline-block;
        margin: 0.5rem;
        border: 2px solid #ccc;
        border-radius: 0.25rem;
        padding: 0.5rem;
        cursor: pointer;
    }

    .attachment-container.selected {
        border-color: #000;
    }

    .upload-container {
        position: absolute;
        min-width: 20rem;
    }
</style>