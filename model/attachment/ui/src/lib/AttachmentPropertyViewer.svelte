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
    import {afterUpdate} from "svelte";
    import {getAttachments} from "./helpers";

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

    afterUpdate(() => console.log({attachmentList, recordPath, record}))

</script>


{#if attachmentList && attachmentList.attachmentReferences.length > 0}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences} on:deleteAttachments={deleteAttachments}/>
{:else}
    <p>----</p>
{/if}

