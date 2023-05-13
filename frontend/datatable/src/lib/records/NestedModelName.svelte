<script lang="ts">
    import type {NestedModel} from "@cozemble/model-core";
    import {type Model, modelNameFns, modelPluralNameFns} from "@cozemble/model-core";
    import {EditableName} from "@cozemble/ui-atoms";
    import {modelRecordsContextFns} from "$lib/records/modelRecordsContextFns";
    import {coreModelEvents} from "@cozemble/model-event-sourced";
    import {contextHelper} from "$lib/stores/contextHelper";
    import DownCaret from "$lib/icons/DownCaret.svelte";
    import {modelUi} from "$lib/modelUi";
    import {allEventSourcedModels} from "$lib/stores/allModels";

    export let model: Model
    export let nestedModel: NestedModel
    const nestedModelBeingEdited = modelRecordsContextFns.getNestedModelBeingEdited()
    const modelControls = modelRecordsContextFns.getModelControls()
    const eventSourcedModel = modelRecordsContextFns.getEventSourcedModel()
    const permitModelling = contextHelper.getPermitModelling()
    let anchorElement: HTMLDivElement

    $: nameable = {
        name: model.name.value
    }
    $: pluralNameable = {
        name: model.pluralName.value
    }

    function onNameChange(newName: string) {
        modelControls.updateModel(model.id, coreModelEvents.modelRenamed(model.id, modelNameFns.newInstance(newName)))
        modelControls.updateModel(model.id, coreModelEvents.modelPluralRenamed(model.id, modelPluralNameFns.newInstance(newName)))
        $nestedModelBeingEdited = null
    }

    function openNestedTableNamesModal() {
        modelUi.edit($allEventSourcedModels, $eventSourcedModel,anchorElement)
    }

</script>
<div class="flex" bind:this={anchorElement}>
    {#if nestedModel.cardinality === "one"}
        <EditableName {nameable} {onNameChange} extraClass="nested-model-name"
                      editImmediately={$nestedModelBeingEdited?.value === nestedModel.id.value}/>
    {:else}
        <EditableName nameable={pluralNameable} {onNameChange} extraClass="nested-model-name"
                      editImmediately={$nestedModelBeingEdited?.value === nestedModel.id.value}/>
        {#if $permitModelling}
            <div class="mt-1 ml-2 nested-model-name-caret" on:click={openNestedTableNamesModal}>
                <DownCaret/>
            </div>
        {/if}
    {/if}
</div>
