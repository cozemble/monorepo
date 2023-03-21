<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import type {AttachmentList} from "@cozemble/model-attachment-core";
    import {dataRecordPathFns} from "@cozemble/model-api";
    import AttachmentView from "./AttachmentView.svelte";

    export let recordPath: DataRecordPath
    export let record: DataRecord
    let error: string | null = null

    $: value = dataRecordPathFns.getValue(recordPath, record) as AttachmentList ?? null
</script>

{#if value}
    {#each value.attachmentReferences as attachment}
        <AttachmentView {attachment}/>
    {/each}
{:else}
    <p>No attachments</p>
{/if}

{#if error}
    <p>{error}</p>
{/if}