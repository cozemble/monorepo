<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from "@cozemble/model-core";
    import {assembleEditorParams, type EditorParams} from "./editorHelper";
    import type {UserInstruction} from "@cozemble/data-editor-sdk";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import ModelReferenceViewerInner from "./ModelReferenceViewerInner.svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const dataRecordViewerClient = dataRecordViewer.getClient()
    let editorParams: EditorParams | UserInstruction | null = null
    let error: string | null = null

    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
        } catch (e: any) {
            console.error(e)
            error = e.message
        }
    })

    function instructUser() {
        if (editorParams && editorParams._type === 'user.instruction') {
            dataRecordViewerClient.instructUser(editorParams)
        }
    }
</script>

{#if editorParams}
    {#if editorParams._type === 'editor.params'}
        <ModelReferenceViewerInner {systemConfiguration} {editorParams} {record} {recordPath}/>
    {:else if editorParams._type === 'user.instruction'}
        <p>{editorParams.userContextMessage}</p>
        <a class="link" href="#!" on:click={instructUser}>Show me how</a>
    {/if}
{/if}


{#if error}
    <p>{error}</p>
{/if}