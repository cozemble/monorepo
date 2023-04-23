<script lang="ts">
    import type {Model} from "@cozemble/model-core";
    import type {Writable} from "svelte/store";
    import {derived, writable} from "svelte/store";
    import {tick} from "svelte";
    import {positionModal} from "./modelUi";
    import {cantBeOneOf, conditionalErrorChecks, notNull, required} from "./errors";
    import type {EventSourcedStore} from "./stores/EventSourcedStore";
    import type {TablesAction} from "./tables/actions";
    import {addTableAction} from "./tables/actions";
    import type {JustErrorMessage} from "@cozemble/lang-util";

    export let tables: EventSourcedStore<Model[], TablesAction>

    let rootDiv: HTMLDivElement;
    let addTableModal: HTMLDivElement;
    let newTableName: Writable<string | null> = writable(null);
    const newTableNameErrors = derived([newTableName, tables], ([tableName, models]) => conditionalErrorChecks(tableName, notNull(), required(), cantBeOneOf(models.map(m => m.name.value), 'Table name already exists')))
    const showErrors = writable(false)
    let saveError: JustErrorMessage | null = null

    async function addTable() {
        newTableName.set(`Table ${$tables.length + 1}`)
        await tick()
        positionModal(addTableModal, rootDiv)
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

    function cancelNewTable() {
        newTableName.set(null)
    }

    function onKeyUp(event: KeyboardEvent) {
        if (event.key === 'Escape') {
            cancelNewTable()
        }
        if(event.key === 'Enter') {
            saveNewTable()
        }
    }
</script>

<svelte:window on:keyup={onKeyUp} />

<div bind:this={rootDiv}>
    {#if $tables.length === 0}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add your first table</a>
    {:else}
        <a class="tab tab-lg"
           on:click={addTable}>+ Add table</a>
    {/if}
</div>

<div bind:this={addTableModal} class="coz-modal" class:invisible={$newTableName === null}>
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
