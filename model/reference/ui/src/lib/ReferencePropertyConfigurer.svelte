<script lang="ts">
    import type {ReferenceProperty} from "@cozemble/model-reference-core";
    import {
        referencedModelChangedModelEvent,
        referencePropertyDescriptor,
        referencePropertyFns
    } from '@cozemble/model-reference-core'
    import {editorClient} from '@cozemble/model-editor-sdk'
    import MaybeErrorMessage from './MaybeErrorMessage.svelte'
    import {afterUpdate, createEventDispatcher} from 'svelte'
    import type {Model} from "@cozemble/model-core";

    export let model: Model
    export let property: ReferenceProperty

    const formSectionErrorState = editorClient.getErrorState()
    const models = editorClient.getModels()
    const otherModels = $models.filter(m => m.id.value !== model.id.value)
    const otherModelIds = otherModels.map(model => model.id)
    const dispatch = createEventDispatcher()

    afterUpdate(() => {
        console.log({models: $models, otherModels})
    })

    $: referencedModelId = referencePropertyFns.oneReference(property)

    $: errors = referencePropertyDescriptor.validateProperty(property)

    function referencedModelChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const newValue = target.value
        const referencedModelId = otherModelIds.find(modelId => modelId.value === newValue) ?? null
        dispatch('modelChanged', referencedModelChangedModelEvent(model.id, property.id, referencedModelId))
    }
</script>

<label for="referencedModel">Referenced Model</label>
<br/>
<select id="referencedModel" on:change={referencedModelChanged}>
    <option selected={referencedModelId === null}>----</option>
    {#each otherModels as model}
        <option value={model.id.value}
                selected={model.id.value === referencedModelId?.value}>{model.name.value}</option>
    {/each}
</select>

<MaybeErrorMessage
        showErrors={$formSectionErrorState.showErrors}
        {errors}
        key="referencedModels"/>
