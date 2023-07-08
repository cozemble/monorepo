<script lang="ts">
    import type {ModelId, ModelSlot, PropertyDescriptor, SystemConfiguration} from '@cozemble/model-core'
    import {
        modelReferenceIdFns,
        modelReferenceNameFns,
        modelSlotNameFns,
        propertyDescriptors,
        propertyIdFns,
        propertyNameFns,
        propertyTypeFns,
    } from '@cozemble/model-core'
    import {editorHost, emptyFormErrorState} from '@cozemble/model-editor-sdk'
    import type {Writable} from "svelte/store";
    import {readable, writable} from 'svelte/store'
    import {createEventDispatcher, tick} from 'svelte'
    import type {EventSourcedModelList} from "@cozemble/model-event-sourced";
    import {coreModelEvents, eventSourcedModelListFns, modelSlotEvents} from '@cozemble/model-event-sourced'
    import PropertyEditor from "./PropertyEditor.svelte";
    import {validateSlot} from "./validateSlot";
    import ModelReferenceEditor from "./ModelReferenceEditor.svelte";
    import {mandatory} from "@cozemble/lang-util";
    import {modelFns} from "@cozemble/model-api";
    import {objects} from "@cozemble/lang-util";

    export let modelList: Writable<EventSourcedModelList>
    export let modelId: ModelId
    export let slotId: string
    export let systemConfiguration: SystemConfiguration
    export let slotNoun = 'Property'

    $: models = $modelList.models.map((m) => m.model)
    $: model = mandatory(models.find((m) => m.id.value === modelId.value), `Could not find model ${modelId.value}`)
    $: modelSlot = mandatory(modelFns.elementById(model, slotId) as ModelSlot,`Could not find slot ${slotId} in model ${modelId.value}`)

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)
    editorHost.setModels(readable(models))

    function slotTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        if (target.value === 'model.reference') {
            return modelList.update(list => eventSourcedModelListFns.addModelEvent(list,
                modelSlotEvents.newModelReference(modelId,
                    modelReferenceNameFns.newInstance(modelSlot.name.value),
                    modelReferenceIdFns.newInstance(modelSlot.id.value)),
            ))
        }
        const propertyDescriptor = propertyDescriptors.get(propertyTypeFns.newInstance(target.value))
        if (propertyDescriptor) {
            const propertyName = propertyNameFns.newInstance(modelSlot.name.value)
            const propertyId = propertyIdFns.newInstance(modelSlot.id.value)
            return modelList.update(list => eventSourcedModelListFns.addModelEvent(list, propertyDescriptor.newProperty(systemConfiguration, modelId, propertyName, propertyId)))
        } else {
            alert('Dont know how to handle model slot type ' + target.value)
        }
    }

    $: errors = validateSlot(modelSlot)
    const dispatch = createEventDispatcher()

    function closeClicked() {
        dispatch('close')
    }

    function saveClicked() {
        const errors = validateSlot(modelSlot)
        $formSectionErrorState.showErrors = errors.size > 0
        if (errors.size === 0) {
            console.log({slot: modelSlot})
            modelList.update(list => ({...list}))
            dispatch('save', {slot: modelSlot})
        }
    }

    function slotNameChanged(event: Event) {
        const target = event.target as HTMLInputElement
        modelList.update(list => eventSourcedModelListFns.addModelEvent(list, coreModelEvents.slotRenamed(
            modelId,
            modelSlot.id,
            modelSlotNameFns.newInstance(modelSlot._type, target.value),
        )))
    }

    function isPropertyForDescriptor(slot: ModelSlot, propertyDescriptor: PropertyDescriptor) {
        return slot._type === 'property' && slot.propertyType.value === propertyDescriptor.propertyType.value
    }

    function isModelReference(slot: ModelSlot) {
        return slot._type === 'model.reference'
    }

    async function onKeyDown(event: KeyboardEvent) {
        if (event.key === 'Enter') {
            if (document.activeElement instanceof HTMLInputElement) {
                document.activeElement.blur()
            }
            await tick()
            saveClicked()
        }
    }
</script>

<svelte:window on:keydown={onKeyDown}/>

<form>
    <label class="label">{slotNoun} Name</label>
    <input
            value={modelSlot.name.value}
            class="property-name input input-bordered first w-full"
            on:change={slotNameChanged}/>

    <label class="label">{slotNoun} Type</label>
    <select on:change={slotTypeChanged} class="property-type input input-bordered  w-full">
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
                {modelList}
                {model}/>
    {:else if modelSlot._type === 'model.reference'}
        <ModelReferenceEditor
                modelReference={modelSlot}
                {modelList}
                {modelId}/>
    {:else}
        <p>To do ${modelSlot._type}</p>
    {/if}
</form>

<br/>
<div class="flex">
    <button
            type="submit"
            on:click|preventDefault={saveClicked}
            class="btn save-property btn-primary">Save {slotNoun}
    </button>
    <button class="btn btn-secondary ml-2" on:click={closeClicked}>Cancel</button>
</div>