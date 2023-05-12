<script lang="ts">
    import type {SlotBeingEdited} from "./helpers";
    import {createEventDispatcher, onMount} from "svelte";
    import type {ModelChangeHandler} from "@cozemble/model-editor";
    import {ModelSlotEditor} from "@cozemble/model-editor";
    import type {ModelEvent, ModelId, ModelSlot} from "@cozemble/model-core";
    import {eventSourcedModelFns} from "@cozemble/model-event-sourced";
    import {modelFns} from "@cozemble/model-api";
    import {positionModal} from "../modelUi";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {clickOutside} from "@cozemble/ui-atoms";

    export let slotBeingEdited: SlotBeingEdited
    let model = slotBeingEdited.model
    let slot = slotBeingEdited.slot
    const models = slotBeingEdited.models.map(m => m.model)
    let modal: HTMLDivElement
    const dispatch = createEventDispatcher()

    function close() {
        dispatch('close')
    }

    const modelChangeHandler: ModelChangeHandler = {
        modelChanged(modelId: ModelId, action: ModelEvent) {
            model = eventSourcedModelFns.addEvent(model, action)
            slot = modelFns.elementById(model.model, slot.id.value) as ModelSlot
        }
    }

    function saveSlot() {
        dispatch('edited', {model})
    }

    function onKeyup(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            close()
        }
    }

    onMount(() => positionModal(modal, slotBeingEdited.anchorElement))
</script>

<svelte:window on:keyup={onKeyup}/>

<div class="coz-modal" bind:this={modal} use:clickOutside
     on:click_outside={close}>
    <div class="modal-box mx-2">
        <h3 class="font-bold text-lg">Edit {slot.name.value}</h3>
        <ModelSlotEditor systemConfiguration={$systemConfiguration} {models} model={model.model} {modelChangeHandler}
                         modelSlot={slot}
                         slotNoun="Field" on:save={saveSlot} on:close={close}/>
    </div>
</div>