<script lang="ts">
    import type {Property, PropertyDescriptor} from "@cozemble/model-core";
    import {propertyRegistry} from "@cozemble/model-core";
    import {propertyConfigurerRegistry} from "@cozemble/model-assembled";
    import {editorHost, emptyFormErrorState} from "@cozemble/model-editor-sdk";
    import {writable} from 'svelte/store'
    import {afterUpdate, createEventDispatcher} from 'svelte'

    export let property: Property

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)

    let propertyDescriptor: PropertyDescriptor | null = null

    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        propertyDescriptor = propertyRegistry.get(target.value)
        if (propertyDescriptor) {
            property = {...propertyDescriptor.newProperty(), id: property.id, name: property.name}
        } else {
            property = {...property, _type: ""}
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
    <input bind:value={property.name}/><br/>
    <label>Property Type</label><br/>
    <select on:change={propertyTypeChanged}>
        <option value="">----</option>
        {#each propertyRegistry.list() as registeredProperty}
            <option value={registeredProperty.id}>{registeredProperty.name.name}</option>
        {/each}
    </select><br/>
    {#if configurer}
        <svelte:component this={configurer} property={property}/>
    {/if}
</form>
<button on:click|preventDefault={saveClicked} disabled={errors.size > 0}>Save</button>
