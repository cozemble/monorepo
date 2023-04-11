<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from "@cozemble/model-core";
    import type {UserInstruction} from "@cozemble/data-editor-sdk";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {assembleEditorParams} from "./editorHelper";
    import ModelReferenceEditorInner from "./ModelReferenceEditorInner.svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration


    const dataRecordEditorClient = dataRecordEditor.getClient()
    let editorParams: EditorParams | UserInstruction | null = null
    let error: string | null = null

    onMount(() => {
        try {
            editorParams = assembleEditorParams(dataRecordEditorClient, recordPath)
        } catch (e: any) {
            console.error(e)
            error = e.message
        }
    })

    function instructUser() {
        if (editorParams && editorParams._type === 'user.instruction') {
            dataRecordEditorClient.instructUser(editorParams)
        }
    }
</script>

{#if editorParams}
    {#if editorParams._type === 'editor.params'}
        <ModelReferenceEditorInner {systemConfiguration} {editorParams} {record} {recordPath}/>
    {:else if editorParams._type === 'user.instruction'}
        <p>{editorParams.userContextMessage}</p>
        <a class="link" href="#!" on:click={instructUser}>Show me how</a>
    {/if}
{/if}


{#if error}
    <p>{error}</p>
{/if}