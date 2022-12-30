<script lang="ts">
    import {
        propertyConfigurerRegistry,
        propertyRegistry,
        registerAllProperties,
        registerAllPropertyConfigurers
    } from "@cozemble/model-assembled";
    import type Property from "@cozemble/model-core";
    import {afterUpdate, onMount} from 'svelte'
    import {editorHost, emptyFormErrorState} from "@cozemble/model-editor-sdk";
    import {writable} from 'svelte/store'
    import type {PropertyDescriptor} from "@cozemble/model-core";

    const formSectionErrorState = writable(emptyFormErrorState())
    editorHost.setErrorState(formSectionErrorState)

    let mounted = false
    onMount(() => {
        registerAllProperties()
        registerAllPropertyConfigurers()
        mounted = true
    })

    let property: Property = {
        _type: "",
        id: "1",
        name: ""
    }
    let propertyDescriptor: PropertyDescriptor | null = null

    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        propertyDescriptor = propertyRegistry.get(target.value)
        if (propertyDescriptor) {
            property = {...propertyDescriptor.newProperty(), id: property.id, name: property.name}
        } else {
            property = {...property, type: ""}
        }
    }

    afterUpdate(() => console.log({property, errors}))

    $: configurer = propertyConfigurerRegistry.get(property._type)
    $: errors = propertyDescriptor?.validate(property) ?? new Map()

    function saveClicked() {
        const errors = propertyDescriptor?.validate(property) ?? new Map()
        console.log({errors, propertyDescriptor})
        $formSectionErrorState.showErrors = errors.size > 0
    }
</script>

{#if mounted}
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
{/if}
