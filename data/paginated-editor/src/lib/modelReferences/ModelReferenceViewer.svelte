<script lang="ts">
    import type {DataRecord, DataRecordValuePath} from "@cozemble/model-core";
    import {assembleEditorParams, type EditorParams} from "./editorHelper";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import ModelReferenceViewerInner from "./ModelReferenceViewerInner.svelte";
    import type {SystemConfiguration} from "@cozemble/model-core";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration


    const dataRecordViewerClient = dataRecordViewer.getClient()
    let editorParams: EditorParams | null = null
    let error: string | null = null


    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
        } catch (e: any) {
            error = e.message
        }
    })
</script>

{#if editorParams}
    <ModelReferenceViewerInner {systemConfiguration} {editorParams} {record} {recordPath}/>
{/if}


{#if error}
    <p>{error}</p>
{/if}