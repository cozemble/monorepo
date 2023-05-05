<script lang="ts">
    import type {AttachmentReference} from "@cozemble/model-attachment-core";
    import AttachmentView from "./AttachmentView.svelte";
    import AttachmentsRibbon from "./AttachmentsRibbon.svelte";
    import {createEventDispatcher} from "svelte";

    export let attachments: AttachmentReference[]
    let selectedAttachments: AttachmentReference[] = []
    const dispatch = createEventDispatcher()

    function toggleSelection(attachment: AttachmentReference) {
        if (selectedAttachments.includes(attachment)) {
            selectedAttachments = selectedAttachments.filter(a => a !== attachment)
        } else {
            selectedAttachments = [...selectedAttachments, attachment]
        }
    }

    function onDeleteAttachments(event: CustomEvent<AttachmentReference[]>) {
        const attachmentReferences = event.detail
        selectedAttachments = selectedAttachments.filter(a => !attachmentReferences.includes(a))
        dispatch("deleteAttachments", attachmentReferences)
    }
</script>

{#if selectedAttachments.length > 0}
    <AttachmentsRibbon {selectedAttachments} on:deleteAttachments={onDeleteAttachments}/>
{/if}
{#each attachments as attachment}
    {@const selected = selectedAttachments.includes(attachment)}
    <div class="attachment-container" on:click={() => toggleSelection(attachment)} class:selected>
        <AttachmentView {attachment}/>
    </div>
{/each}

<style>
    .attachment-container {
        display: inline-block;
        margin: 0.5rem;
        border: 2px solid #ccc;
        border-radius: 0.25rem;
        padding: 0.5rem;
        cursor: pointer;
    }

    .selected {
        border-color: #000;
    }
</style>
