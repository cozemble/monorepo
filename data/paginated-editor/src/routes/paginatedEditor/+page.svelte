<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import PaginatedEditor from '$lib/PaginatedEditor.svelte'
    import {onMount} from 'svelte'
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers,
    } from '@cozemble/model-assembled'
    import {pageEditorLocalStorageKey} from './context'
    import {allModels, invoiceModel} from "../testModels";

    let models: Model[]
    let model: Model | null = null
    let records: DataRecord[] = []

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
</script>

{#if model}
    <PaginatedEditor {models} {model} {records}/>
{/if}
