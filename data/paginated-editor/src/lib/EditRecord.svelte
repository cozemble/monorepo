<script lang="ts">
    import DataRecordEditor from "$lib/DataRecordEditor.svelte";
    import type {DataRecordEditEvent, DataRecordEditorClient} from "@cozemble/model-editor-sdk";
    import {dataRecordEditorHost} from "@cozemble/model-editor-sdk";
    import type {RecordEditContext} from "$lib/RecordEditContext";
    import {afterUpdate} from "svelte";

    export let recordEditContext: RecordEditContext
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

    function handleCancel() {
        recordEditContext.cancel()
    }

    function handleSave() {
        recordEditContext.attemptSave()
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            recordEditContext.handleDataRecordEditEvent(event)
        },
    }
    dataRecordEditorHost.setClient(dataRecordEditorClient)

    afterUpdate(() => console.log({recordEditContext}))
</script>

<DataRecordEditor {recordEditContext} {pushContext} {popContext}/>

<div class="buttons">
    <button type="button" class="save" on:click={handleSave}>Save</button>
    <button type="button" class="cancel" on:click={handleCancel}>Cancel</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>