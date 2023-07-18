<script lang="ts">
    import ExpandCollapseButton from "$lib/records/ExpandCollapseButton.svelte";
    import type {DataRecord, DataRecordId, Model} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import {editorExtensions} from "$lib/extensions/editorExtensions.js";

    export let model: Model
    export let record: DataRecord
    export let oneOnly: boolean
    export let expandedRecordIds: Writable<DataRecordId[]>

    const maybeButtonExtensions = editorExtensions.getRecordButtonExtensions()

    console.log({maybeButtonExtensions})

</script>

<div class="flex items-center">
    <ExpandCollapseButton {expandedRecordIds} {model} {record}/>

    {#if !oneOnly}
        <button class="btn btn-ghost btn-active btn-sm  mr-2" on:click={() => alert('to do')}>
            Delete
        </button>
    {/if}
    {#if maybeButtonExtensions}
        <svelte:component this={maybeButtonExtensions.component} {...maybeButtonExtensions.props}/>
    {/if}
</div>
