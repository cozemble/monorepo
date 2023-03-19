<script lang="ts">
    import type {DataRecord, DataRecordPath} from '@cozemble/model-core'
    import {dataRecordEditor,} from '@cozemble/data-editor-sdk'
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {assembleEditorParams} from "./editorHelper";
    import ReferencePropertyEditorWithValues from "./ReferencePropertyEditorWithValues.svelte";

    export let recordPath: DataRecordPath
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
    <ReferencePropertyEditorWithValues {editorParams} {record} {recordPath}/>
{/if}


{#if error}
    <p>{error}</p>
{/if}