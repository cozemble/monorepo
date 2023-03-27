<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import type {AttachmentList, AttachmentReference} from "@cozemble/model-attachment-core";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordPath
    export let record: DataRecord

    const viewClient = dataRecordViewer.getClient()

    $: attachmentList = dataRecordPathFns.getValue(recordPath, record) as AttachmentList ?? ({
        _type: 'attachment.list',
        attachmentReferences: []
    })

    function deleteAttachments(event: CustomEvent<AttachmentReference[]>) {
        const attachmentReferences = event.detail
        const newAttachmentList = {
            ...attachmentList,
            attachmentReferences: attachmentList.attachmentReferences.filter(attachmentReference => !attachmentReferences.includes(attachmentReference))
        }
        viewClient.dispatchEditEvent(
            dataRecordEditEvents.valueChanged(
                record,
                recordPath,
                attachmentList,
                newAttachmentList,
                null,
            ),
        )
        console.log({attachmentList, newAttachmentList})

    }
</script>


{#if attachmentList}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences} on:deleteAttachments={deleteAttachments}/>
{:else}
    <p>No attachments</p>
{/if}

