<script lang="ts">
    import type {EventSourcedModelStore} from "./types";
    import {writable} from "svelte/store";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import {addTableAction} from "./tables/actions";
    import {createEventDispatcher, onMount} from "svelte";
    import {positionModal} from "./modelUi";
    import {editableTableName} from "./models/editableTableName";
    import EditableStringInput from "../lib/editors/EditableStringInput.svelte";
    import {allEventSourcedModels} from "./stores/allModels";

    export let anchorElement: HTMLElement;

    const tableName = editableTableName(`Table ${$allEventSourcedModels.length + 1}`, $allEventSourcedModels)
    const newTableNameErrors = tableName.errors
    const newTableName = tableName.value

    const showErrors = writable(false)
    const dispatch = createEventDispatcher()
    let saveError: JustErrorMessage | null = null
    let addTableModal: HTMLDivElement

    function cancelNewTable() {
        dispatch('finished')
    }

    function onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            cancelNewTable()
        }
        if (event.key === 'Enter') {
            saveNewTable()
        }
    }

    async function saveNewTable() {
        saveError = null
        if ($newTableNameErrors.length > 0) {
            showErrors.set(true)
        } else {
            if ($newTableName === null) {
                throw new Error('newTableName is null')
            }
            allEventSourcedModels.dispatch(addTableAction($newTableName, $newTableName))
            const saveOutcome = await allEventSourcedModels.save()
            if (saveOutcome === null) {
                cancelNewTable()
            } else {
                saveError = saveOutcome
            }
        }
    }

    onMount(() => positionModal(addTableModal, anchorElement))
</script>

<svelte:window on:keyup={onKeyUp}/>

<div bind:this={addTableModal} class="coz-modal">
    <div class="modal-box mx-8">
        <h3 class="font-bold text-lg">Add new table</h3>
        <div class="mt-2">
            <label class="label">Table name (should be plural)</label>
            <EditableStringInput value={tableName} {showErrors} extraClasses="first" />
        </div>
        <div class="modal-action justify-center">
            <label class="btn btn-primary" on:click={saveNewTable}>Add table</label>
            <label class="btn btn-secondary" on:click={cancelNewTable}>Cancel</label>
        </div>
    </div>
</div>
