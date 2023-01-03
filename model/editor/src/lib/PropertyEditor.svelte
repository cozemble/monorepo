<script lang="ts">
    import type {ModelId, Property, PropertyDescriptor} from "@cozemble/model-core";
    import {propertyDescriptors, propertyTypeFns} from "@cozemble/model-core";
    import {propertyConfigurerRegistry} from "@cozemble/model-assembled";
    import {editorHost, emptyFormErrorState} from "@cozemble/model-editor-sdk";
    import {writable} from 'svelte/store'
    import {afterUpdate, createEventDispatcher} from 'svelte'
    import type {ModelChangeHandler} from "$lib/ModelEditorHost";
    import {coreModelEvents} from "@cozemble/model-event-sourced";

    export let modelChangeHandler: ModelChangeHandler
    export let modelId: ModelId
    export let property: Property

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)

    let propertyDescriptor: PropertyDescriptor | null = null

    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        propertyDescriptor = propertyDescriptors.get(propertyTypeFns.newInstance(target.value))
        if (propertyDescriptor) {
            modelChangeHandler.modelChanged(modelId, propertyDescriptor.newProperty(property.id.id))
        } else {
            alert("No property descriptor found for " + target.value)
        }
    }

    afterUpdate(() => console.log({property, errors}))

    $: configurer = propertyConfigurerRegistry.get(property._type)
    $: errors = propertyDescriptor?.validateProperty(property) ?? new Map()
    const dispatch = createEventDispatcher()

    function saveClicked() {
        const errors = propertyDescriptor?.validateProperty(property) ?? new Map()
        $formSectionErrorState.showErrors = errors.size > 0
        if (errors.size === 0) {
            dispatch("save", {property})
        }
    }

    function propertyNameChanged(event: Event) {
        const target = event.target as HTMLInputElement
        modelChangeHandler.modelChanged(modelId, coreModelEvents.propertyRenamed(property.id, target.value))
    }
</script>


<form>
    <label>Property Name</label><br/>
    <input bind:value={property.name} class="property-name" on:change={propertyNameChanged}/><br/>
    <label>Property Type</label><br/>
    <select on:change={propertyTypeChanged} class="property-type">
        <option value="">----</option>
        {#each propertyDescriptors.list() as propertyDescriptor}
            <option value={propertyDescriptor.propertyType.type}
                    selected={propertyTypeFns.equals(property._type,propertyDescriptor.propertyType)}>{propertyDescriptor.name.name}</option>
        {/each}
    </select><br/>
    {#if configurer}
        <svelte:component this={configurer} property={property}/>
    {/if}
</form>
<button type="submit" on:click|preventDefault={saveClicked} disabled={errors.size > 0} class="save-property">Save
</button>
