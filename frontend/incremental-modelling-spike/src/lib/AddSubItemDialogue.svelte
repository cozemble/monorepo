<script lang="ts">
    import type {Model} from "./types";
    import {createEventDispatcher} from "svelte";

    const dispatch = createEventDispatcher()

    export let model: Model
    let addingSubRecord = false
    let addingSubTable = false
    let subRecordName = ''
    let applyError = ''

    function addSubRecord() {
        addingSubRecord = true
    }

    function addSubTable() {
        addingSubTable = true
    }

    function close() {
        dispatch('close')
    }

    function startOver() {
        addingSubRecord = false
        addingSubTable = false
        subRecordName = ''
        applyError = ''
    }

    function applySubRecord() {
        if (subRecordName.length === 0) {
            applyError = 'Please enter a name for the sub-record'
        } else {
            console.log('adding sub-record', subRecordName)
        }

    }
</script>

<div class="flex divide-x">
    <div>
        <h6>Adding a sub item to {model.name}</h6>
        <div class="flex flex-col mt-2">
            <div class="flex flex-col text-sm">
                <p class="mb-1">Sub-items are like tables inside tables</p>
                <p class="mb-1">They have their own fields - as many as you want</p>
                <p class="mb-1">And you can have as many sub-items as you want</p>
                <p class="mb-1">Use sub-items to break your data into logical sections</p>
                <br/>
                <p class="mb-1">A <strong>sub-record</strong> is a table that will always contain one row</p>
                <p class="mb-1">For example, a <em>Customer</em> has one <em>"Home Address"</em></p>
                <br/>
                <p class="mb-1">A <strong>sub-table</strong> is a table that can contain any number of rows</p>
                <p class="mb-1">For example, an <em>Invoice</em> has many <em>"Line Items"</em></p>
            </div>
        </div>
        <button class="btn" on:click={close}>Cancel sub-item</button>
    </div>
    <div class="ml-4 pl-4">
        {#if addingSubRecord}
            <h6>Name of the sub-record:</h6>
            <input class="input input-bordered" bind:value={subRecordName} placeholder="Sub-record name"/>
            <div class="ml-3 text-sm">e.g. a Customer has one "Home Address"</div>
            <div class="mt-3">
                {#if applyError}
                    <div class="text-red-500 mb-2">{applyError}</div>
                {/if}
                <button class="btn btn-primary" on:click={applySubRecord}>Apply</button>
                <button class="btn btn-secondary" on:click={startOver}>Start over</button>
            </div>
        {:else if addingSubTable}
        {:else}
            <button class="btn btn-secondary btn-sm" on:click={addSubRecord}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Add a sub-record
            </button>
            <div class="ml-3 text-sm">e.g. a Customer has one "Home Address"</div>
            <button class="btn btn-secondary btn-sm mt-8" on:click={addSubTable}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                     stroke-width="1.5"
                     stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M12 4.5v15m7.5-7.5h-15"/>
                </svg>
                Add a sub-table
            </button>
            <div class="ml-3 text-sm  mb-4">e.g. an Invoice has a table of "Line Items"</div>

        {/if}
    </div>
</div>
