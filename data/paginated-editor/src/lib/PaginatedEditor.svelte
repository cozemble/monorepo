<script lang="ts">
    import type {DataRecord, Model, ModelView, SystemConfiguration} from '@cozemble/model-core'
    import type {CellFocus} from './CellFocus'
    import {writable, type Writable} from 'svelte/store'
    import DataTd from './DataTd.svelte'
    import StackingRecordEditor from './StackingRecordEditor.svelte'
    import {RecordEditContext, type RecordSaveOutcome} from './RecordEditContext'
    import type {EventSourcedDataRecord, EventSourcedDataRecordOption} from '@cozemble/data-editor-sdk'
    import {dataRecordViewerHost, eventSourcedDataRecordFns} from '@cozemble/data-editor-sdk'
    import type {PaginatedEditorHost} from './PaginatedEditorHost'
    import {makeDataRecordViewer} from "./makeDataRecordViewer";
    import {slotEditorRegistry, slotViewerRegistry} from "@cozemble/model-assembled";
    import ModelReferenceViewer from "./modelReferences/ModelReferenceViewer.svelte";
    import ModelReferenceEditor from "./modelReferences/ModelReferenceEditor.svelte";

    export let models: Model[]
    export let model: Model
    export let records: DataRecord[]
    export let paginatedEditorHost: PaginatedEditorHost
    export let modelViews: ModelView[]
    export let onNewRecord: EventSourcedDataRecordOption = (record) => record
    export let systemConfiguration: SystemConfiguration

    dataRecordViewerHost.setClient(makeDataRecordViewer(systemConfiguration, models, modelViews, paginatedEditorHost, recordEdited, onError))

    let focus: Writable<CellFocus | null> = writable(null)
    let doAddNewRecord = false
    let recordBeingEdited: DataRecord | null = null
    let modelLevelErrors: string[] = []

    function onError(error: Error) {
        modelLevelErrors = [...modelLevelErrors, error.message]
    }

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

    slotViewerRegistry.register('model.reference', ModelReferenceViewer)
    slotEditorRegistry.register('model.reference', ModelReferenceEditor)
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
            recordEditContext={new RecordEditContext( models, justSaveNewRecord,onNewRecord(eventSourcedDataRecordFns.newInstance(models, model.id, 'test-user')), saveNewRecord, () => (doAddNewRecord = false), `Add new ${model.name.value}`,systemConfiguration )}/>
{:else if recordBeingEdited !== null}
    <StackingRecordEditor
            recordSearcher={paginatedEditorHost} {modelViews}
            attachmentsManager={paginatedEditorHost}
            recordEditContext={new RecordEditContext( models, justSaveNewRecord,eventSourcedDataRecordFns.fromRecord(models, recordBeingEdited), recordEdited, () => (recordBeingEdited = null), `Edit ${model.name.value}`, systemConfiguration)}/>
{:else}
    <table class="table">
        <thead>
        <tr>
            {#each model.slots as slot}
                <th class="data-cell">{slot.name.value}</th>
            {/each}
            <th>Actions</th>
        </tr>
        </thead>
        <tbody>
        {#each records as record, rowIndex}
            <tr data-row-index={rowIndex}>
                {#each model.slots as modelSlot, colIndex}
                    {#if modelSlot._type === 'property' || modelSlot._type === 'model.reference'}
                        <DataTd {systemConfiguration} {focus} {rowIndex} {colIndex} {record} {modelSlot}/>
                    {:else}
                        <td>To do: {modelSlot._type}</td>
                    {/if}
                {/each}
                <td>
                    <button class="edit btn btn-active btn-ghost btn-sm" on:click={() => viewRecord(record)}>Details
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
        <button type="button" class="btn add-record btn-primary" on:click={beginAddNewRecord}>
            Add {model.name.value}</button>
    </div>
{/if}

<style>
    .add-record {
        margin-top: 1rem;
    }
</style>
