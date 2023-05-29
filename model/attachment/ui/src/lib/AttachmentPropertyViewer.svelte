<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from '@cozemble/model-core'
    import type {AttachmentReference} from "@cozemble/model-attachment-core";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {getAttachments} from "./helpers";
    import {dataRecordEditEvents} from "@cozemble/model-event-sourced";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const viewClient = dataRecordViewer.getClient()

    $: attachmentList = getAttachments(systemConfiguration, recordPath, record)

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


{#if attachmentList && attachmentList.attachmentReferences.length > 0}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences} on:deleteAttachments={deleteAttachments}/>
{:else}
    <p>----</p>
{/if}

