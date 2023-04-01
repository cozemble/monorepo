<script lang="ts">
    import type {DataRecord, DataRecordPropertyPath} from '@cozemble/model-core'
    import {assembleEditorParams, type EditorParams} from "./editorHelper";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import ReferencePropertyViewerWithParams from "./ReferencePropertyViewerWithParams.svelte";

    export let recordPath: DataRecordPropertyPath
    export let record: DataRecord
    let editorParams: EditorParams | null = null
    let error: string | null = null

    const dataRecordViewerClient = dataRecordViewer.getClient()

    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
        } catch (e: any) {
            error = e.message
        }
    })


</script>

{#if editorParams}
    <ReferencePropertyViewerWithParams {dataRecordViewerClient} {editorParams} {record} {recordPath}/>
{/if}

{#if error}
    <p>{error}</p>
{/if}