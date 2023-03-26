<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import type {AttachmentList} from "@cozemble/model-attachment-core";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";

    export let recordPath: DataRecordPath
    export let record: DataRecord


    $: attachmentList = dataRecordPathFns.getValue(recordPath, record) as AttachmentList ?? ({
        _type: 'attachment.list',
        attachmentReferences: []
    })

</script>


{#if attachmentList}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences}/>
{:else}
    <p>No attachments</p>
{/if}

