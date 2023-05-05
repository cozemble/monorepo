<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from "@cozemble/model-core";
    import type {UserInstruction} from "@cozemble/data-editor-sdk";
    import {dataRecordEditor} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import type {EditorParams} from "./editorHelper";
    import {assembleEditorParams} from "./editorHelper";
    import ModelReferenceEditorInner from "./ModelReferenceEditorInner.svelte";
    import {type ConfigureViewParams, makeConfigureViewParams} from "./ConfigureViewParams";
    import ConfigureViewModal from "./ConfigureViewModal.svelte";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const dataRecordEditorClient = dataRecordEditor.getClient()
    const models = dataRecordEditorClient.getModels()

    let editorParams: EditorParams | UserInstruction | null = null
    let error: string | null = null
    let configureViewParams: ConfigureViewParams | null = null


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

    async function onConfigureView() {
        configureViewParams = await makeConfigureViewParams(dataRecordEditorClient, models, recordPath)
    }

    function cancelConfigureViewModal() {
        configureViewParams = null
    }

    function viewConfigured() {
        cancelConfigureViewModal()
        editorParams = assembleEditorParams(dataRecordEditorClient, recordPath)
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

{#if configureViewParams}
    <ConfigureViewModal {configureViewParams}
                        modelViewManager={dataRecordEditorClient}
                        on:cancel={cancelConfigureViewModal} on:saved={viewConfigured}/>
{/if}