<script lang="ts">
    import type {DataRecord, DataRecordPropertyPath} from '@cozemble/model-core'
    import {dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {assembleEditorParams} from "./editorHelper";
    import ReferencePropertyEditorWithParams from "./ReferencePropertyEditorWithParams.svelte";

    export let recordPath: DataRecordPropertyPath
    export let record: DataRecord
    let editorParams: EditorParams | null = null
    let error: string | null = null
    const dataRecordEditorClient = dataRecordEditor.getClient()


    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordEditorClient, recordPath)
        } catch (e: any) {
            error = e.message
        }
    })

</script>

{#if editorParams}
    <ReferencePropertyEditorWithParams {editorParams} {record} {recordPath}/>
{/if}


{#if error}
    <p>{error}</p>
{/if}