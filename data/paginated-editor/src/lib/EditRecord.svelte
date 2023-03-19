<script lang="ts">
    import DataRecordEditor from './DataRecordEditor.svelte'
    import type {DataRecordControlEvent, DataRecordEditEvent, DataRecordEditorClient,} from '@cozemble/data-editor-sdk'
    import {dataRecordEditorHost} from '@cozemble/data-editor-sdk'
    import type {RecordEditContext} from './RecordEditContext'
    import {getEditRecordListener} from './EditRecordListener'
    import {getContext, onDestroy, onMount} from 'svelte'
    import type {DataRecord, ModelId, ModelView} from "@cozemble/model-core";
    import type {RecordSearcher} from "./RecordSearcher";
    import type {Model} from "@cozemble/model-core";

    export let recordEditContext: RecordEditContext
    export let recordSearcher: RecordSearcher
    export let modelViews: ModelView[]
    export let pushContext: (context: RecordEditContext) => void
    export let popContext: () => void

    const editListener = getEditRecordListener(getContext)

    function handleCancel() {
        recordEditContext.cancel()
    }

    async function handleSave() {
        await recordEditContext.attemptSave()
    }

    const dataRecordEditorClient: DataRecordEditorClient = {
        dispatchEditEvent(event: DataRecordEditEvent): void {
            editListener.onEvent(recordEditContext, event)
            recordEditContext.handleDataRecordEditEvent(event)
        },
        dispatchControlEvent(event: DataRecordControlEvent): void {
            console.log({event})
        },
        searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
            return recordSearcher.searchRecords(modelId, search)
        },
        getModelViews(modelId: ModelId): ModelView[] {
            return modelViews.filter(modelView => modelView.modelId.value === modelId.value)
        },
        getModels(): Model[] {
            return recordEditContext.models
        }
    }

    dataRecordEditorHost.setClient(dataRecordEditorClient)

    onMount(() => {
        editListener.beginEdit(recordEditContext)
    })
    onDestroy(() => {
        editListener.popEdit()
    })
</script>

<DataRecordEditor {recordEditContext} {pushContext} {popContext}/>

<div class="buttons btn-group my-4">
    <button type="button" class="save btn btn-primary" on:click={handleSave}>Save</button>
    <button type="button" class="cancel btn btn-error" on:click={handleCancel}>Cancel</button>
</div>

<style>
    .buttons {
        margin-top: 1rem;
    }
</style>
