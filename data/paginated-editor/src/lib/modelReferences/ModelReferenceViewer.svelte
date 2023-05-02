<script lang="ts">
    import type {
        DataRecord,
        DataRecordValuePath,
        Model,
        ModelReference,
        SystemConfiguration
    } from "@cozemble/model-core";
    import {assembleEditorParams, type EditorParams} from "./editorHelper";
    import type {UserInstruction} from "@cozemble/data-editor-sdk";
    import {dataRecordViewer} from "@cozemble/data-editor-sdk";
    import {onMount} from "svelte";
    import ModelReferenceViewerInner from "./ModelReferenceViewerInner.svelte";
    import ConfigureViewModal from "./ConfigureViewModal.svelte";
    import {modelFns} from "@cozemble/model-api";
    import {writable} from "svelte/store";

    export let recordPath: DataRecordValuePath
    export let record: DataRecord
    export let systemConfiguration: SystemConfiguration

    const dataRecordViewerClient = dataRecordViewer.getClient()
    const models = dataRecordViewerClient.getModels()
    const model = modelFns.findById(models, record.modelId)
    let editorParams: EditorParams | UserInstruction | null = null
    let error: string | null = null
    let containerElement: HTMLDivElement
    let configureView = false
    let referencedModel: Model | null = null
    const sampleRecords = writable([] as DataRecord[])

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

    async function onConfigureView() {
        if (recordPath.lastElement._type !== 'model.reference') {
            throw new Error("Expected last element to be a model reference")
        }
        const modelReference = recordPath.lastElement as ModelReference
        if (modelReference.referencedModels.length !== 1) {
            throw new Error("Expected model reference to have exactly one referenced model")
        }
        const referencedModelId = modelReference.referencedModels[0]
        referencedModel = modelFns.findById(models, referencedModelId)
        configureView = true
        const found = await dataRecordViewerClient.searchRecords(referencedModel.id, "")
        // take at most three
        sampleRecords.set(found.slice(0, 3))
    }

    function cancelConfigureViewModal() {
        configureView = false
        referencedModel = null
    }

    function viewConfigured() {
        cancelConfigureViewModal()
        editorParams = assembleEditorParams(dataRecordViewerClient, recordPath)
        console.log({editorParams})
    }
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

{#if configureView && referencedModel}
    <ConfigureViewModal {models} model={referencedModel} sampleRecords={$sampleRecords} modelViewManager={dataRecordViewerClient}
                        on:cancel={cancelConfigureViewModal} on:saved={viewConfigured}/>
{/if}