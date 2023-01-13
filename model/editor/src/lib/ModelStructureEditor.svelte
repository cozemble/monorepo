<script lang="ts">
    import type {Property} from '@cozemble/model-core'
    import {modelIdAndNameFns, propertyDescriptors, propertyNameFns, relationshipNameFns} from '@cozemble/model-core'
    import PropertyEditor from '$lib/PropertyEditor.svelte'
    import AddNestedModelDialog from '$lib/AddNestedModelDialog.svelte'
    import type {ModelEditorHost} from '$lib/ModelEditorHost'
    import {modelFns, modelOptions} from '@cozemble/model-api'
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import {coreModelEvents} from '@cozemble/model-event-sourced'


    export let host: ModelEditorHost
    export let allModels: EventSourcedModel[]
    export let eventSourced: EventSourcedModel
    $: model = eventSourced.model
    let propertyBeingEdited: Property | null = null

    function addProperty() {
        const propertyName = `Property ${model.properties.length + 1}`
        host.modelChanged(
            model.id,
            propertyDescriptors
                .getDefault()
                .newProperty(model.id, propertyNameFns.newInstance(propertyName)),
        )
    }

    function editProperty(p: Property) {
        propertyBeingEdited = p
    }

    function propertyEdited(_event: CustomEvent) {
        // const property = event.detail.property
        // host.modelChanged({...model, properties: model.properties.map(p => p.id === property.id ? property : p)})
        propertyBeingEdited = null
    }

    let addingNestedModel = false

    function addNestedModel() {
        addingNestedModel = true
    }

    function onRelationshipAdded(event: CustomEvent) {
        const {cardinality, modelName, relationshipName} = event.detail
        const relatedModel = modelFns.newInstance(
            modelName,
            modelOptions.withParentModelId(model.id),
        )
        const parentModel = modelIdAndNameFns.newInstance(model.id, model.name)
        const childModel = modelIdAndNameFns.newInstance(
            relatedModel.id,
            relatedModel.name,
        )

        host.modelAdded(relatedModel)
        host.modelChanged(
            model.id,
            coreModelEvents.relationshipAdded(
                parentModel,
                childModel,
                cardinality,
                relationshipNameFns.newInstance(relationshipName),
            ),
        )
        addingNestedModel = false
    }
</script>

{#if addingNestedModel}
    <AddNestedModelDialog
            on:relationshipAdded={onRelationshipAdded}
            on:cancel={() => (addingNestedModel = false)}
            parentModel={model}
    />
{:else if propertyBeingEdited}
    <PropertyEditor
            property={propertyBeingEdited}
            modelChangeHandler={host}
            {model}
            on:save={propertyEdited}
    />
{:else}
    <div data-model-name={model.name.value}>
        <table>
            <thead>
            <tr>
                {#each model.properties as property}
                    <th>{property.name.value}</th>
                {/each}
                <th/>
            </tr>
            </thead>
            <tbody>
            <tr>
                {#each model.properties as property}
                    <td>
                        <button
                                on:click={() => editProperty(property)}
                                class="edit-property"
                                data-property-name={property.name.value}
                        >Edit
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
    {@const eventSourced = host.modelWithId(allModels, relationship.modelId)}
    <div class="relationship-container">
        <h5>{relationship.name.value}</h5>
        <svelte:self {allModels} {eventSourced} {host}/>
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

    th,
    td {
        border: 1px solid black;
        padding: 0.5rem;
    }
</style>
