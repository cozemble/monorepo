<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import type {CellFocus} from '$lib/CellFocus'
    import {writable, type Writable} from 'svelte/store'
    import DataTd from '$lib/DataTd.svelte'
    import StackingRecordEditor from "./StackingRecordEditor.svelte";
    import {RecordEditContext} from "./RecordEditContext";
    import type {EventSourcedDataRecord} from "@cozemble/data-editor-sdk";
    import {eventSourcedDataRecordFns} from "@cozemble/data-editor-sdk";

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

    function recordEdited(editedRecord: EventSourcedDataRecord) {
        records = records.map(record => record.id.value === editedRecord.record.id.value ? editedRecord.record : record)
        recordBeingEdited = null
    }

    function saveNewRecord(newRecord: EventSourcedDataRecord) {
        records = [...records, newRecord.record]
        doAddNewRecord = false
    }
</script>

{#if doAddNewRecord}
    <StackingRecordEditor
            recordEditContext={new RecordEditContext(models, eventSourcedDataRecordFns.newInstance(models, model.id,  'test-user'), saveNewRecord, () => doAddNewRecord = false, `Add new ${model.name.value}`)}/>
{:else if recordBeingEdited !== null}
    <StackingRecordEditor
            recordEditContext={new RecordEditContext(models, eventSourcedDataRecordFns.fromRecord(models,recordBeingEdited), recordEdited, () => recordBeingEdited = null, `Edit ${model.name.value}`)}/>
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
        <button type="button" class="add-record" on:click={beginAddNewRecord}>Add {model.name.value}</button>
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
