<script lang="ts">
    import type {ModelId, Property} from "@cozemble/model-core";
    import PropertyEditor from "$lib/PropertyEditor.svelte";
    import {modelFns, propertyOptions} from "@cozemble/model-api";
    import AddNestedModelDialog from "$lib/AddNestedModelDialog.svelte";
    import type {ModelEditorHost} from "$lib/ModelEditorHost";
    import {afterUpdate} from "svelte";

    export let modelId: ModelId
    export let host: ModelEditorHost
    $: model = host.modelWithId(modelId)
    let propertyBeingEdited: Property | null = null

    afterUpdate(() => console.log({model}))

    function addProperty() {
        host.modelChanged(modelFns.addProperty(model, propertyOptions.named("Untitled property")))
    }

    function editProperty(p: Property) {
        propertyBeingEdited = p
    }

    function propertyEdited(event: CustomEvent) {
        const property = event.detail.property
        host.modelChanged({...model, properties: model.properties.map(p => p.id === property.id ? property : p)})
        propertyBeingEdited = null
    }

    let addingNestedModel = false

    function addNestedModel() {
        addingNestedModel = true
    }

    function relationshipAdded(event: CustomEvent) {
        const {cardinality, modelName, relationshipName} = event.detail
        const {model: mutated, relatedModel} = modelFns.addRelationship(cardinality, modelName, relationshipName, model)

        host.modelAdded(relatedModel)
        host.modelChanged(mutated)
        addingNestedModel = false
    }
</script>

{#if addingNestedModel}
    <AddNestedModelDialog on:relationshipAdded={relationshipAdded}
                          on:cancel={() => addingNestedModel = false}
                          parentModel={model}/>
{:else if propertyBeingEdited}
    <PropertyEditor property={propertyBeingEdited} on:save={propertyEdited}/>
{:else}
    <div data-model-name={model.name}>
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
                        <button on:click={() => editProperty(property)} class="edit-property"
                                data-property-name={property.name}>Edit
                        </button>
                    </td>
                {/each}
                <td>
                    <button on:click={addProperty} class="add-property">Add property</button>
                </td>
            </tr>
            </tbody>
        </table>
        <div class="actions">
            <button on:click={addNestedModel} class="add-nested-model">Add nested model</button>
        </div>
    </div>
{/if}

{#each model.relationships as relationship}
    <div class="relationship-container">
        <h5>{relationship.name}</h5>
        <svelte:self modelId={relationship.modelId} {host}/>
    </div>
{/each}

<style>
    .actions {
        margin-top: 1em;
    }

    .relationship-container {
        margin-left: 30px;
    }

    table {
        border-collapse: collapse;
    }

    th, td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>