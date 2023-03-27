<script lang="ts">
    import type {AttachmentReference} from "@cozemble/model-attachment-core";
    import {createEventDispatcher} from "svelte";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk/dist/esm/index.js";

    export let selectedAttachments: AttachmentReference[]
    const viewClient = dataRecordViewer.getClient()
    const dispatch = createEventDispatcher()

    async function viewClicked() {
        const urls = await viewClient.getAttachmentViewUrls(selectedAttachments.map(attachment => ({attachmentId:attachment.attachmentId, fileName:attachment.fileName})))
        urls.forEach(url => {
            window.open(url, "_blank")
        })
    }

    function deleteClicked() {
        if (selectedAttachments.length === 1) {
            if (!confirm("Are you sure you want to delete this attachment?")) {
                dispatch("deleteAttachments", selectedAttachments)
            }

        } else {
            if (confirm("Are you sure you want to delete the selected attachments?")) {
                dispatch("deleteAttachments", selectedAttachments)
            }
        }
    }
</script>
<div class="border border-gray-300 rounded">
    <ul class="menu menu-horizontal bg-base-100 rounded-box p-2">
        <li on:click={viewClicked}><a>View</a></li>
<!--        <li on:click={deleteClicked}><a>Delete</a></li>-->
    </ul>
    {#if selectedAttachments.length > 1}
        ({selectedAttachments.length} items selected)
    {/if}
</div>