<script lang="ts">
    import type {Property, PropertyId} from '@cozemble/model-core'
    import {modelIdAndNameFns, nestedModelNameFns, propertyDescriptors, propertyNameFns,} from '@cozemble/model-core'
    import PropertyEditor from './PropertyEditor.svelte'
    import AddNestedModelDialog from './AddNestedModelDialog.svelte'
    import type {ModelEditorHost} from './ModelEditorHost'
    import {modelFns, modelOptions} from '@cozemble/model-api'
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import {coreModelEvents} from '@cozemble/model-event-sourced'

    export let host: ModelEditorHost
    export let allModels: EventSourcedModel[]
    export let eventSourced: EventSourcedModel
    $: allCoreModels = allModels.map((m) => m.model)
    $: model = eventSourced.model
    let propertyIdBeingEdited: PropertyId | null = null
    $: propertyBeingEdited = modelFns.maybePropertyWithId(model, propertyIdBeingEdited)

    function addProperty() {
        const propertyName = `Property ${model.slots.length + 1}`
        host.modelChanged(
            model.id,
            propertyDescriptors
                .getDefault()
                .newProperty(model.id, propertyNameFns.newInstance(propertyName)),
        )
    }

    function editProperty(p: Property) {
        propertyIdBeingEdited = p.id
    }

    function propertyEdited(_event: CustomEvent) {
        propertyIdBeingEdited = null
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
            coreModelEvents.nestedModelAdded(
                parentModel,
                childModel,
                cardinality,
                nestedModelNameFns.newInstance(relationshipName),
            ),
        )
        addingNestedModel = false
    }
</script>

{#if addingNestedModel}
    <AddNestedModelDialog
            on:relationshipAdded={onRelationshipAdded}
            on:cancel={() => (addingNestedModel = false)}
            parentModel={model}/>
{:else if propertyBeingEdited}
    <PropertyEditor
            property={propertyBeingEdited}
            modelChangeHandler={host}
            models={allCoreModels}
            {model}
            on:save={propertyEdited}/>
{:else}
    <div data-model-name={model.name.value}>
        <table>
            <thead>
            <tr>
                {#each model.slots as slot}
                    <th>{slot.name.value}</th>
                {/each}
            </tr>
            </thead>
            <tbody>
            <tr>
                {#each model.slots as slot}
                    <td>
                        {#if slot._type === 'property'}
                            <button on:click={() => editProperty(slot)}
                                    class="btn btn-active btn-ghost edit-property"
                                    data-property-name={slot.name.value}>Edit
                            </button>
                        {:else}
                            <p>To do {slot._type}</p>
                        {/if}
                    </td>
                {/each}
                <td>
                    <button on:click={addProperty} class="btn btn-active btn-ghost add-property">Add property</button>
                </td>
            </tr>
            </tbody>
        </table>
        <div class="actions">
            <br/>
            <button on:click={addNestedModel} class="btn btn-active btn-ghost add-nested-model">Add nested model
            </button>
        </div>
    </div>
{/if}

{#each model.nestedModels as nestedModel}
    {@const eventSourced = host.modelWithId(allModels, nestedModel.modelId)}
    <div class="nested-model-container">
        <h5>{nestedModel.name.value}</h5>
        <svelte:self {allModels} {eventSourced} {host}/>
    </div>
{/each}

<style>
    .actions {
        margin-top: 1em;
    }

    .nested-model-container {
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
