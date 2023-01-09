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
    let doAddNewRecord = false;

    function deleteRecord(_record: DataRecord) {
    }

    function editRecord(_record: DataRecord) {
    }

    function beginAddNewRecord() {
        doAddNewRecord = true
        // records = [...records, dataRecordFns.newInstance(model, 'test-user')]
        // $mode = 'edit'
        // setCellFocus(records.length - 1, 0)
    }


    function addNewRecord(_event: CustomEvent) {

    }
</script>

{#if doAddNewRecord}
    <EditRecord {models} {model} record={dataRecordFns.newInstance(model, 'test-user')} on:save={addNewRecord}
                on:cancel={() => doAddNewRecord = false}/>
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
            <tr>
                {#each model.properties as property, colIndex}
                    <DataTd {focus} {rowIndex} {colIndex} {record} {property}/>
                {/each}
                <td>
                    <button on:click={() => editRecord(record)}>Edit</button>
                    <button on:click={() => deleteRecord(record)}>Delete</button>
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
