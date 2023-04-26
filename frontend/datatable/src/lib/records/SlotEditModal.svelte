<script lang="ts">
    import type {SlotBeingEdited} from "./helperTypes";
    import {createEventDispatcher} from "svelte";

    export let slotBeingEdited: SlotBeingEdited
    let modal: HTMLDivElement
    const dispatch = createEventDispatcher()

    function save() {
        dispatch('close')
    }

    function close() {
        dispatch('close')
    }
</script>

<div class="coz-modal" bind:this={modal}>
    <div class="modal-box  mx-8">
        <h3 class="font-bold text-lg">Edit table</h3>
        <div class="modal-action justify-center">
            <label class="btn btn-primary" on:click={save}>Save</label>
            <label class="btn btn-secondary" on:click={close}>Cancel</label>
        </div>
    </div>
</div>