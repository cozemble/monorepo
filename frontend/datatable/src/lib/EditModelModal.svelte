<script lang="ts">
    import {eventSourcedStore} from "./stores/EventSourcedStore";
    import {editModelModal, type EditModelModalState, modelUi, positionModal} from "./modelUi";
    import {mandatory} from "@cozemble/lang-util";
    import {modelReducer} from "./models/modelReducer";
    import {saveModel} from "./appBackend";
    import {editablePluralTableName, editableTableName} from "./models/editableTableName";
    import EditableStringInput from "./editors/EditableStringInput.svelte";
    import {writable} from "svelte/store";
    import {coreModelEvents} from "@cozemble/model-event-sourced";
    import {modelNameFns, modelPluralNameFns} from "@cozemble/model-core";
    import {editableValueFns} from "./editors/editableValue";
    import {dispatchChange} from "./editors/dispatchChange";
    import {onMount} from "svelte";
    import {clickOutside} from "@cozemble/ui-atoms";

    export let state: EditModelModalState
    const modelList = state.modelList

    const eventSourcedModel = eventSourcedStore(modelReducer, saveModel, mandatory($editModelModal, `Edit model not configured`).model)
    const tableName = editableTableName(state.model.model.name.value, $modelList.models)
    const pluralTableName = editablePluralTableName(state.model.model.pluralName.value, $modelList.models)
    const showErrors = writable(false)
    let modal: HTMLDivElement

    async function save() {
        if (editableValueFns.hasErrors([tableName, pluralTableName])) {
            $showErrors = true
        } else {
            let changed = [dispatchChange(eventSourcedModel, tableName, (newName) => coreModelEvents.modelRenamed(state.model.model.id, modelNameFns.newInstance(mandatory(newName, `Cannot set name to null`))))]
            changed = [...changed, dispatchChange(eventSourcedModel, pluralTableName, (newPluralName) => coreModelEvents.modelPluralRenamed(state.model.model.id, modelPluralNameFns.newInstance(mandatory(newPluralName, `Cannot set plural name to null`))))]
            if (changed.some(c => c)) {
                const saveOutcome = await eventSourcedModel.save()
                modelUi.handleSaveOutcome(saveOutcome)
            } else {
                modelUi.closeEditModelModal()
            }
        }
    }

    function onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            modelUi.closeEditModelModal()
        }
        if (event.key === 'Enter') {
            save()
        }
    }

    function close() {
        modelUi.closeEditModelModal()
    }

    onMount(() => positionModal(modal, state.anchorElement))

</script>

<svelte:window on:keyup={onKeyUp}/>

<div class="coz-modal" bind:this={modal} use:clickOutside
     on:click_outside={close}>
    <div class="modal-box mx-8">
        <h3 class="font-bold text-lg">Edit table</h3>
        <div class="form-control">
            <label class="label">Table name (singular)</label>
            <EditableStringInput value={tableName} {showErrors} extraClasses="first singular"/>
        </div>
        <div class="form-control mt-2">
            <label class="label">Table name (plural)</label>
            <EditableStringInput value={pluralTableName} {showErrors} extraClasses="plural"/>
        </div>
        <div class="modal-action justify-center">
            <label class="btn btn-primary" on:click={save}>Save</label>
            <label class="btn btn-secondary" on:click={close}>Cancel</label>
        </div>
    </div>
</div>
