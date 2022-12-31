<script lang="ts">
    import type {Model, Property} from "@cozemble/model-core";
    import {properties as propertyFns} from "@cozemble/model-core";
    import PropertyEditor from "$lib/PropertyEditor.svelte";
    import {createEventDispatcher} from "svelte";

    export let model: Model
    let propertyBeingEdited: Property | null = null
    const dispatch = createEventDispatcher()

    function addProperty() {
        model = {...model, properties: [...model.properties, {...propertyFns.nullInstance(), name: "Untitled property"}]}
        dispatch("changed", {model})
    }

    function editProperty(p: Property) {
        propertyBeingEdited = p
    }

    function propertyEdited(event: CustomEvent) {
        const property = event.detail.property
        model = {...model, properties: model.properties.map(p => p.id === property.id ? property : p)}
        propertyBeingEdited = null
        dispatch("changed", {model})
    }
</script>

{#if propertyBeingEdited}
    <PropertyEditor property={propertyBeingEdited} on:save={propertyEdited}/>
{:else}
    <table>
        <thead>
        <tr>
            {#each model.properties as property}
                <th>{property.name}</th>
            {/each}
            <th></th>
        </tr>
        </thead>
        <tbody>
        <tr>
            {#each model.properties as property}
                <td>
                    <button on:click={() => editProperty(property)}>Edit</button>
                </td>
            {/each}
            <td>
                <button on:click={addProperty}>Add property</button>
            </td>
        </tr>
        </tbody>
    </table>
{/if}
<style>
    table {
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>