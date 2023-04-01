<script lang="ts">
    import type {Model, ModelSlot, PropertyDescriptor} from '@cozemble/model-core'
    import {modelSlotNameFns, propertyDescriptors, propertyTypeFns,} from '@cozemble/model-core'
    import {editorHost, emptyFormErrorState} from '@cozemble/model-editor-sdk'
    import {readable, writable} from 'svelte/store'
    import {createEventDispatcher} from 'svelte'
    import type {ModelChangeHandler} from './ModelEditorHost'
    import {coreModelEvents} from '@cozemble/model-event-sourced'
    import PropertyEditor from "./PropertyEditor.svelte";
    import {validateSlot} from "./validateSlot";
    import {propertyIdFns, propertyNameFns} from "@cozemble/model-core";

    export let modelChangeHandler: ModelChangeHandler
    export let model: Model
    export let models: Model[]
    export let modelSlot: ModelSlot

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)
    editorHost.setModels(readable(models))


    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        let propertyDescriptor = propertyDescriptors.get(
            propertyTypeFns.newInstance(target.value),
        )
        if (propertyDescriptor) {
            const propertyName = propertyNameFns.newInstance(modelSlot.name.value)
            const propertyId = propertyIdFns.newInstance(modelSlot.id.value)
            modelChangeHandler.modelChanged(
                model.id,
                propertyDescriptor.newProperty(model.id, propertyName, propertyId),
            )
        } else {
            alert('No property descriptor found for ' + target.value)
        }
    }

    $: errors = validateSlot(modelSlot)
    const dispatch = createEventDispatcher()

    function saveClicked() {
        const errors = validateSlot(modelSlot)
        $formSectionErrorState.showErrors = errors.size > 0
        if (errors.size === 0) {
            dispatch('save', {slot: modelSlot})
        }
    }

    function slotNameChanged(event: Event) {
        const target = event.target as HTMLInputElement
        modelChangeHandler.modelChanged(
            model.id,
            coreModelEvents.slotRenamed(
                model.id,
                modelSlot.id,
                modelSlotNameFns.newInstance(modelSlot._type, target.value),
            ),
        )
    }

    function isPropertyForDescriptor(slot: ModelSlot, propertyDescriptor: PropertyDescriptor) {
        return slot._type === 'property' && slot.propertyType.value === propertyDescriptor.propertyType.value
    }

    function isModelReference(slot: ModelSlot) {
        return slot._type === 'model.reference'
    }

</script>


<form>
    <label class="label">Property Name</label><br/>
    <input
            value={modelSlot.name.value}
            class="property-name input input-bordered"
            on:change={slotNameChanged}/>
    <br/>
    <label class="label">Property Type</label><br/>
    <select on:change={propertyTypeChanged} class="property-type input input-bordered">
        <option value="">----</option>
        {#each propertyDescriptors.list() as propertyDescriptor}
            <option
                    value={propertyDescriptor.propertyType.value}
                    selected={isPropertyForDescriptor(modelSlot, propertyDescriptor)}>{propertyDescriptor.name.value}</option>
        {/each}
        <option value="model.reference" selected={isModelReference(modelSlot)}>Link to another record</option>
    </select>

    {#if modelSlot._type === 'property'}
        <PropertyEditor
                property={modelSlot}
                {modelChangeHandler}
                {model}/>
    {:else}
        <p>To do ${modelSlot._type}</p>
    {/if}
</form>

<br/>
<button
        type="submit"
        on:click|preventDefault={saveClicked}
        disabled={errors.size > 0}
        class="btn save-property">Save Property
</button>
