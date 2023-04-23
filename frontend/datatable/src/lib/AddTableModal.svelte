<script lang="ts">
    import type {EventSourcedModelStore} from "./types";
    import {cantBeOneOf, conditionalErrorChecks, notNull, required} from "./errors";
    import {derived, writable, type Writable} from "svelte/store";
    import type {JustErrorMessage} from "@cozemble/lang-util";
    import {addTableAction} from "./tables/actions";
    import {onMount} from "svelte";
    import {positionModal} from "./modelUi";
    import {createEventDispatcher} from "svelte";

    export let anchorElement: HTMLElement;
    export let tables: EventSourcedModelStore

    let newTableName: Writable<string> = writable(`Table ${$tables.length + 1}`);
    const newTableNameErrors = derived([newTableName, tables], ([tableName, models]) => conditionalErrorChecks(tableName, notNull(), required(), cantBeOneOf(models.map(m => m.name.value), 'Table name already exists')))
    const showErrors = writable(false)
    const dispatch = createEventDispatcher()
    let saveError: JustErrorMessage | null = null
    let addTableModal: HTMLDivElement

    function cancelNewTable() {
        newTableName.set(null)
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
            tables.dispatch(addTableAction($newTableName, $newTableName))
            const saveOutcome = await tables.saveAndFlushActions()
            if (saveOutcome === null) {
                cancelNewTable()
            } else {
                saveError = saveOutcome
            }
        }
    }

    onMount(() => {
        positionModal(addTableModal, anchorElement)
    })
</script>

<svelte:window on:keyup={onKeyUp}/>

<div bind:this={addTableModal} class="coz-modal">
    <div class="modal-box  mx-8">
        <h3 class="font-bold text-lg">Add new table</h3>
        <div class="mt-2">
            <label>Table name</label><br/>
            <input type="text" class="input input-bordered w-full first"
                   placeholder="Table name" bind:value={$newTableName}/>
            {#if $showErrors && $newTableNameErrors.length > 0}
                <div class="text-error">{$newTableNameErrors[0]}</div>
            {/if}
        </div>
        <div class="modal-action justify-center">
            <label class="btn btn-primary" on:click={saveNewTable}>Add</label>
            <label class="btn btn-secondary" on:click={cancelNewTable}>Cancel</label>
        </div>
    </div>
</div>
