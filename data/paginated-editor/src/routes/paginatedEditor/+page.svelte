<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import PaginatedEditor from '$lib/PaginatedEditor.svelte'
    import {onMount, setContext} from 'svelte'
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers,
    } from '@cozemble/model-assembled'
    import {pageEditorLocalStorageKey} from './context'
    import {allModels, invoiceModel} from "../testModels";
    import type {EditRecordListener} from "$lib/EditRecordListener";
    import {setEditRecordListener} from "$lib/EditRecordListener";
    import type {RecordEditContext} from "$lib/RecordEditContext";
    import type {DataRecordEditEvent} from "@cozemble/data-editor-sdk";
    import EditEventInspector from "./EditEventInspector.svelte";

    let models: Model[]
    let model: Model | null = null
    let records: DataRecord[] = []
    let editContexts: RecordEditContext[] = []

    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        const localStored = localStorage.getItem(pageEditorLocalStorageKey)
        if (localStored) {
            models = JSON.parse(localStored) as Model[]
            model = models[0]
            console.log('Loaded model from local storage', model)
        } else {

            models = [...allModels]
            model = invoiceModel
        }
    })

    const editRecordListener: EditRecordListener = {
        beginEdit(context: RecordEditContext) {
            editContexts = [...editContexts, context]
        },
        popEdit() {
            editContexts = editContexts.slice(0, editContexts.length - 1)
        },
        onEvent: (context: RecordEditContext, _event: DataRecordEditEvent) => {
            editContexts = [...editContexts.slice(0, editContexts.length - 1), context]
        }
    }

    setEditRecordListener(setContext, editRecordListener)
</script>

{#if model}
    <PaginatedEditor {models} {model} {records}/>
{/if}

<hr>

<EditEventInspector {editContexts}/>
