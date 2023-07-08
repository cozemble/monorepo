<script lang="ts">
    import type {SlotBeingEdited} from "./helpers";
    import {createEventDispatcher, onMount} from "svelte";
    import {ModelSlotEditor} from "@cozemble/model-editor";
    import {positionModal} from "../modelUi";
    import {systemConfiguration} from "../stores/systemConfiguration";
    import {clickOutside} from "@cozemble/ui-atoms";
    import {get} from "svelte/store";
    import {eventSourcedModelListFns} from "@cozemble/model-event-sourced";

    export let slotBeingEdited: SlotBeingEdited
    let model = slotBeingEdited.model
    let slot = slotBeingEdited.slot
    const modelList = slotBeingEdited.modelList

    let modal: HTMLDivElement
    const dispatch = createEventDispatcher()

    function close() {
        dispatch('close')
    }

    function saveSlot() {
        const modelList = get(slotBeingEdited.modelList)
        const model = eventSourcedModelListFns.modelWithId(modelList, slotBeingEdited.model.model.id)
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
        <ModelSlotEditor systemConfiguration={$systemConfiguration} modelList={slotBeingEdited.modelList}
                         modelId={model.model.id}
                         slotId={slot.id.value}
                         slotNoun="Field" on:save={saveSlot} on:close={close}/>
    </div>
</div>

<style>
    .coz-modal {
        width: calc(1ch * 40); /* adjust 10 to the number of characters you want */
    }
</style>