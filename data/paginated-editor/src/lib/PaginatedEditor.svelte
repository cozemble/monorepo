<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import type {CellFocus} from '$lib/CellFocus'
    import {writable, type Writable} from 'svelte/store'
    import DataTd from '$lib/DataTd.svelte'
    import {dataRecordFns} from "@cozemble/model-api";
    import EditRecord from "$lib/EditRecord.svelte";

    export let models: Model[]
    export let model: Model
    export let records: DataRecord[]

    let focus: Writable<CellFocus | null> = writable(null)
    let doAddNewRecord = false
    let recordBeingEdited: DataRecord | null = null

    function deleteRecord(_record: DataRecord) {
    }

    function editRecord(record: DataRecord) {
        recordBeingEdited = record
    }

    function beginAddNewRecord() {
        doAddNewRecord = true
    }


    function addNewRecord(event: CustomEvent) {
        const newRecord = event.detail.record
        records = [...records, newRecord]
        doAddNewRecord = false
    }

    function recordEdited(event: CustomEvent) {
        const editedRecord = event.detail.record
        records = records.map(record => record.id.value === editedRecord.id.value ? editedRecord : record)
        recordBeingEdited = null
    }
</script>

{#if doAddNewRecord}
    <EditRecord {models} {model} record={dataRecordFns.newInstance(model, 'test-user')} on:save={addNewRecord}
                on:cancel={() => doAddNewRecord = false}/>
{:else if recordBeingEdited !== null}
    <EditRecord {models} {model} record={recordBeingEdited} on:save={recordEdited}
                on:cancel={() => recordBeingEdited = null}/>
{:else}
    <table>
        <thead>
        <tr>
            {#each model.properties as property}
                <th class="data-cell">{property.name.value}</th>
            {/each}
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each records as record, rowIndex}
            <tr data-row-index={rowIndex}>
                {#each model.properties as property, colIndex}
                    <DataTd {focus} {rowIndex} {colIndex} {record} {property}/>
                {/each}
                <td>
                    <button class="edit" on:click={() => editRecord(record)}>Edit</button>
                    <button class="delete" on:click={() => deleteRecord(record)}>Delete</button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
    <div class="actions">
        <button type="button" class="add-record" on:click={beginAddNewRecord}>Add record</button>
    </div>
{/if}

<style>
    .data-cell {
        height: 100%;
    }

    .actions {
        margin-top: 20px;
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
