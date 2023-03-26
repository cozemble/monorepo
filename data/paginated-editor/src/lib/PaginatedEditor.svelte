<script lang="ts">
    import type {DataRecord, Model, ModelView} from '@cozemble/model-core'
    import type {CellFocus} from './CellFocus'
    import {writable, type Writable} from 'svelte/store'
    import DataTd from './DataTd.svelte'
    import StackingRecordEditor from './StackingRecordEditor.svelte'
    import {RecordEditContext, type RecordSaveOutcome} from './RecordEditContext'
    import type {EventSourcedDataRecord} from '@cozemble/data-editor-sdk'
    import {dataRecordViewerHost, eventSourcedDataRecordFns} from '@cozemble/data-editor-sdk'
    import type {PaginatedEditorHost} from './PaginatedEditorHost'
    import {makeDataRecordViewer} from "./makeDataRecordViewer";
    import {afterUpdate} from "svelte";

    export let models: Model[]
    export let model: Model
    export let records: DataRecord[]
    export let paginatedEditorHost: PaginatedEditorHost
    export let modelViews: ModelView[]

    dataRecordViewerHost.setClient(makeDataRecordViewer(models, modelViews, paginatedEditorHost))


    let focus: Writable<CellFocus | null> = writable(null)
    let doAddNewRecord = false
    let recordBeingEdited: DataRecord | null = null
    let modelLevelErrors: string[] = []

    async function deleteRecord(record: DataRecord) {
        const confirmed = confirm('Are you sure you want to delete this record?')
        if (confirmed) {
            const outcome = await paginatedEditorHost.deleteRecord(record)
            if (outcome._type === 'just.error.message') {
                modelLevelErrors = [...modelLevelErrors, outcome.message]
            }
        }
    }

    function viewRecord(record: DataRecord) {
        paginatedEditorHost.viewRecord(record, true)
    }

    function editRecord(record: DataRecord) {
        recordBeingEdited = record
    }

    function beginAddNewRecord() {
        doAddNewRecord = true
    }

    async function recordEdited(
        editedRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        const outcome = await paginatedEditorHost.recordEdited(editedRecord)
        if (outcome._type === 'record.save.succeeded') {
            recordBeingEdited = null
        }
        return outcome
    }

    async function justSaveNewRecord(
        newRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        modelLevelErrors = []
        return await paginatedEditorHost.saveNewRecord(newRecord)
    }

    async function saveNewRecord(
        newRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
        modelLevelErrors = []
        const outcome = await justSaveNewRecord(newRecord)
        if (outcome._type === 'record.save.succeeded') {
            doAddNewRecord = false
        } else {
            modelLevelErrors = outcome.errors
        }
        return outcome
    }

    afterUpdate(() => console.log('after update', {doAddNewRecord, recordBeingEdited}))
</script>

{#each modelLevelErrors as error}
    <div class="error" role="alert">
        {error}
    </div>
{/each}
{#if doAddNewRecord}
    <StackingRecordEditor
            recordSearcher={paginatedEditorHost}
            attachmentsManager={paginatedEditorHost}
            {modelViews}
            recordEditContext={new RecordEditContext( models, justSaveNewRecord,eventSourcedDataRecordFns.newInstance(models, model.id, 'test-user'), saveNewRecord, () => (doAddNewRecord = false), `Add new ${model.name.value}`, )}/>
{:else if recordBeingEdited !== null}
    <StackingRecordEditor
            recordSearcher={paginatedEditorHost} {modelViews}
            attachmentsManager={paginatedEditorHost}
            recordEditContext={new RecordEditContext( models, justSaveNewRecord,eventSourcedDataRecordFns.fromRecord(models, recordBeingEdited), recordEdited, () => (recordBeingEdited = null), `Edit ${model.name.value}`, )}/>
{:else}
    <table class="table">
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
                    <button class="edit btn btn-active btn-ghost btn-sm" on:click={() => viewRecord(record)}>View
                    </button>
                    <button class="edit btn btn-active btn-ghost btn-sm" on:click={() => editRecord(record)}>Edit
                    </button>
                    <button class="delete btn btn-active btn-ghost btn-sm" on:click={() => deleteRecord(record)}>
                        Delete
                    </button>
                </td>
            </tr>
        {/each}
        </tbody>
    </table>
    <div class="actions">
        <button type="button" class="btn add-record btn" on:click={beginAddNewRecord}>Add {model.name.value}</button>
    </div>
{/if}

<style>
    .add-record {
        margin-top: 1rem;
    }
</style>
