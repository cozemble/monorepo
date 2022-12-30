<script lang="ts">
    import {propertyRegistry, registerAllProperties} from "@cozemble/model-assembled";
    import type Property from "@cozemble/model-core";
    import {afterUpdate, onMount} from 'svelte'

    let mounted = false
    onMount(() => {
        registerAllProperties()
        mounted = true
    })

    let property: Property = {
        _type: "",
        id: "1",
        name: ""
    }

    function propertyTypeChanged(event: Event) {
        const target = event.target as HTMLSelectElement
        const maybeProperty = propertyRegistry.list().find(pr => pr.name.name === target.value)
        if (maybeProperty) {
            property = {...maybeProperty.newProperty(), id: property.id, name: property.name}
        } else {
            property = {...property, type: ""}
        }
    }

    afterUpdate(() => console.log({property}))
</script>

{#if mounted}
    <form>
        <label>Property Name</label><br/>
        <input bind:value={property.name}/><br/>
        <label>Property Type</label><br/>
        <select on:change={propertyTypeChanged}>
            <option value="">----</option>
            {#each propertyRegistry.list() as registeredProperty}
                <option value={registeredProperty.name.name}>{registeredProperty.name.name}</option>
            {/each}
        </select>
    </form>
{/if}
