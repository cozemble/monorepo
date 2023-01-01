<script lang="ts">
    import type {Property, PropertyDescriptor} from "@cozemble/model-core";
    import {propertyDescriptors} from "@cozemble/model-core";
    import {propertyConfigurerRegistry} from "@cozemble/model-assembled";
    import {editorHost, emptyFormErrorState} from "@cozemble/model-editor-sdk";
    import {writable} from 'svelte/store'
    import {afterUpdate, createEventDispatcher} from 'svelte'
    import {propertyTypeFns} from "@cozemble/model-core";

    export let property: Property

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)

    let propertyDescriptor: PropertyDescriptor | null = null

    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        propertyDescriptor = propertyDescriptors.get(propertyTypeFns.newInstance(target.value))
        if (propertyDescriptor) {
            property = {...propertyDescriptor.newProperty(), id: property.id, name: property.name}
        } else {
            property = {...property, _type: propertyTypeFns.newInstance("")}
        }
    }

    afterUpdate(() => console.log({property, errors}))

    $: configurer = propertyConfigurerRegistry.get(property._type)
    $: errors = propertyDescriptor?.validate(property) ?? new Map()
    const dispatch = createEventDispatcher()

    function saveClicked() {
        const errors = propertyDescriptor?.validate(property) ?? new Map()
        console.log({errors, propertyDescriptor})
        $formSectionErrorState.showErrors = errors.size > 0
        if (errors.size === 0) {
            dispatch("save", {property})
        }
    }
</script>


<form>
    <label>Property Name</label><br/>
    <input bind:value={property.name} class="property-name"/><br/>
    <label>Property Type</label><br/>
    <select on:change={propertyTypeChanged} class="property-type">
        <option value="">----</option>
        {#each propertyDescriptors.list() as propertyDescriptor}
            <option value={propertyDescriptor.propertyType.type} selected={propertyTypeFns.equals(property._type,propertyDescriptor.propertyType)}>{propertyDescriptor.name.name}</option>
        {/each}
    </select><br/>
    {#if configurer}
        <svelte:component this={configurer} property={property}/>
    {/if}
</form>
<button type="submit" on:click|preventDefault={saveClicked} disabled={errors.size > 0} class="save-property">Save</button>
