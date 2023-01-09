<script lang="ts">
    import {createEventDispatcher} from 'svelte';
    import type {DataRecord, Model} from "@cozemble/model-core";
    import DataRecordEditor from "$lib/DataRecordEditor.svelte";
    import type {DataRecordEditEvent, DataRecordEditorClient} from "@cozemble/model-editor-sdk";
    import {dataRecordEditorHost} from "@cozemble/model-editor-sdk";

    export let models: Model[]
    export let model: Model
    export let record: DataRecord

    const dispatch = createEventDispatcher();

    function handleCancel() {
        dispatch("cancel")
    }

    function handleSave() {
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            console.log({event})
        },
    }
    dataRecordEditorHost.setClient(dataRecordEditorClient)

</script>

<DataRecordEditor {models} {model} {record}/>

<div class="buttons">
    <button type="button" on:click={handleSave}>Save</button>
    <button type="button" on:click={handleCancel}>Cancel</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>