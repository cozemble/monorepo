<script lang="ts">
    import type {AttachmentList, AttachmentProperty} from "@cozemble/model-attachment-core";
    import ShowAttachmentThumbs from "./ShowAttachmentThumbs.svelte";

    export let value: AttachmentList | null
    export let property: AttachmentProperty

    $: attachmentList = value ?? {
        _type: 'attachment.list',
        attachmentReferences: [],
    }
</script>


{#if attachmentList && attachmentList.attachmentReferences.length > 0}
    <ShowAttachmentThumbs attachments={attachmentList.attachmentReferences}/>
{:else}
    <p>----</p>
{/if}

