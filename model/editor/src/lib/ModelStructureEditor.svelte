<script lang="ts">
    import type {ModelSlot, ModelSlotId, SystemConfiguration} from '@cozemble/model-core'
    import {modelIdAndNameFns, nestedModelNameFns, propertyDescriptors, propertyNameFns,} from '@cozemble/model-core'
    import ModelSlotEditor from './ModelSlotEditor.svelte'
    import AddNestedModelDialog from './AddNestedModelDialog.svelte'
    import type {ModelEditorHost} from './ModelEditorHost'
    import {modelFns, modelOptions} from '@cozemble/model-api'
    import type {EventSourcedModel} from '@cozemble/model-event-sourced'
    import {coreModelEvents} from '@cozemble/model-event-sourced'
    import {createEventDispatcher} from "svelte";
    import type {EventSourcedModelGraph} from "@cozemble/model-event-sourced";
    import type {Writable} from "svelte/store";

    export let host: ModelEditorHost
    export let modelGraph: Writable<EventSourcedModelGraph>
    export let eventSourced: EventSourcedModel
    export let systemConfiguration: SystemConfiguration

    $: allCoreModels = $modelGraph.models.map((m) => m.model)
    $: model = eventSourced.model
    let slotIdBeingEdited: ModelSlotId | null = null
    $: slotBeingEdited = modelFns.maybeSlotWithId(model, slotIdBeingEdited)

    const dispatch = createEventDispatcher()

    function addProperty() {
        const propertyName = `Property ${model.slots.length + 1}`
        host.modelChanged(
            model.id,
            propertyDescriptors
                .getDefault()
                .newProperty(systemConfiguration, model.id, propertyNameFns.newInstance(propertyName)),
        )
    }

    function editSlot(slot: ModelSlot) {
        slotIdBeingEdited = slot.id
        dispatch("editingSomething", true)
    }

    function slotEdited(_event: CustomEvent) {
        slotIdBeingEdited = null
        dispatch("editingSomething", false)
    }

    let addingNestedModel = false

    function addNestedModel() {
        addingNestedModel = true
        dispatch("editingSomething", true)
    }

    function onNestedModelAdded(event: CustomEvent) {
        const {cardinality, modelName, relationshipName} = event.detail
        const nestdeModel = modelFns.newInstance(
            modelName,
            modelOptions.withParentModelId(model.id),
        )
        const parentModel = modelIdAndNameFns.newInstance(model.id, model.name)
        const childModel = modelIdAndNameFns.newInstance(
            nestdeModel.id,
            nestdeModel.name,
        )

        host.modelAdded(nestdeModel)
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
        dispatch("editingSomething", false)
    }
</script>

{#if addingNestedModel}
    <AddNestedModelDialog
            on:relationshipAdded={onNestedModelAdded}
            on:cancel={() => (addingNestedModel = false)}
            parentModel={model}/>
{:else if slotBeingEdited}
    <ModelSlotEditor
            {systemConfiguration}
            modelChangeHandler={host}
            {modelGraph}
            {model}
            modelSlot={slotBeingEdited}
            on:save={slotEdited}/>
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
                        <button on:click={() => editSlot(slot)}
                                class="btn btn-active btn-ghost edit-property"
                                data-property-name={slot.name.value}>Edit
                        </button>
                    </td>
                {/each}
                <td>
                    <button on:click={addProperty} class="btn btn-active btn-ghost add-property">Add property</button>
                </td>
            </tr>
            </tbody>
        </table>
        <div class="actions">
            <button on:click={addNestedModel} class="btn btn-active btn-ghost add-nested-model btn-sm">Add nested model
            </button>
        </div>
    </div>
{/if}

{#each model.nestedModels as nestedModel}
    {@const eventSourced = host.modelWithId($modelGraph, nestedModel.modelId)}
    <div class="nested-model-container mt-2">
        <h5>{nestedModel.name.value}</h5>
        <svelte:self {modelGraph} {eventSourced} {host}/>
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
