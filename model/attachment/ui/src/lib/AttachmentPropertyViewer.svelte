<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from '@cozemble/model-core'
    import type {AttachmentList, AttachmentReference} from "@cozemble/model-attachment-core";
    import {dataRecordValuePathFns} from "@cozemble/model-api";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {dataRecordEditEvents} from "@cozemble/data-editor-sdk";
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration


    const viewClient = dataRecordViewer.getClient()

    $: attachmentList = dataRecordValuePathFns.getValue(systemConfiguration,recordPath, record) as AttachmentList ?? ({
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
    }
</script>


{#if attachmentList}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences} on:deleteAttachments={deleteAttachments}/>
{:else}
    <p>No attachments</p>
{/if}

