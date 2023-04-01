<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from "@cozemble/model-core";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {assembleEditorParams} from "./editorHelper";
    import ModelReferenceEditorInner from "./ModelReferenceEditorInner.svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord

    const dataRecordEditorClient = dataRecordEditor.getClient()
    let editorParams: EditorParams | null = null
    let error: string | null = null


    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordEditorClient, recordPath)
        } catch (e: any) {
            error = e.message
        }
    })
</script>

{#if editorParams}
    <ModelReferenceEditorInner {editorParams} {record} {recordPath}/>
{/if}


{#if error}
    <p>{error}</p>
{/if}