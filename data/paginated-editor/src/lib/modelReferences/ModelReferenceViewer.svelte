<script lang="ts">
    import type {DataRecord, DataRecordValuePath, SystemConfiguration} from "@cozemble/model-core";
    import {assembleEditorParams, type EditorParams} from "./editorHelper";
    import type {UserInstruction} from "@cozemble/data-editor-sdk";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {afterUpdate} from "svelte";
    import ModelReferenceViewerInner from "./ModelReferenceViewerInner.svelte";
    import ConfigureViewModal from "./ConfigureViewModal.svelte";
    import {modelFns} from "@cozemble/model-api";
    import type {ConfigureViewParams} from "./ConfigureViewParams";
    import {makeConfigureViewParams} from "./ConfigureViewParams";
    import type {DataRecordViewerClient} from "@cozemble/data-editor-sdk";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const dataRecordViewerClient = dataRecordViewer.getClient()
    const models = dataRecordViewerClient.getModels()
    const model = modelFns.findById(models, record.modelId)
    let editorParams: EditorParams | UserInstruction | null = null
    let error: string | null = null
    let containerElement: HTMLDivElement
    let configureViewParams: ConfigureViewParams | null = null

    $: fetchEditorParams(dataRecordViewerClient, recordPath)

    function fetchEditorParams(client: DataRecordViewerClient, recordPath: DataRecordValuePath) {
        error = null
        try {
            editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
        } catch (e: any) {
            console.error(e)
            error = e.message
        }

    }

    function instructUser() {
        if (editorParams && editorParams._type === 'user.instruction') {
            dataRecordViewerClient.instructUser(editorParams)
        }
    }

    async function onConfigureView() {
        configureViewParams = await makeConfigureViewParams(dataRecordViewerClient, models, recordPath)
    }

    function cancelConfigureViewModal() {
        configureViewParams = null
    }

    function viewConfigured() {
        cancelConfigureViewModal()
        // editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
    }

    afterUpdate(() => console.log({editorParams, recordPath, record, systemConfiguration}))
</script>

<div bind:this={containerElement}>
    {#if editorParams}
        {#if editorParams._type === 'editor.params'}
            <ModelReferenceViewerInner {systemConfiguration} {editorParams} {record} {recordPath}/>
        {:else if editorParams._type === 'user.instruction'}
            <button class="btn btn-sm" on:click={onConfigureView}>Configure view</button>
        {/if}
    {/if}
</div>

{#if error}
    <p>{error}</p>
{/if}

{#if configureViewParams}
    <ConfigureViewModal {configureViewParams}
                        modelViewManager={dataRecordViewerClient}
                        on:cancel={cancelConfigureViewModal} on:saved={viewConfigured}/>
{/if}