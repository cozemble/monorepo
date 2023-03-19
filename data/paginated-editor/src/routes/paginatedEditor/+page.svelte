<script lang="ts">
    import type {DataRecordEditEvent, EventSourcedDataRecord,} from '@cozemble/data-editor-sdk'
    import type {DataRecord, Model, ModelId} from '@cozemble/model-core'
    import PaginatedEditor from '../../lib/PaginatedEditor.svelte'
    import {onMount, setContext} from 'svelte'
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers,
    } from '@cozemble/model-assembled'
    import {pageEditorLocalStorageKey} from './context'
    import {allModels, invoiceModel} from '../testModels'
    import type {EditRecordListener} from '../../lib/EditRecordListener'
    import {setEditRecordListener} from '../../lib/EditRecordListener'
    import type {RecordEditContext, RecordSaveOutcome,} from '../../lib/RecordEditContext'
    import type {PaginatedEditorHost, RecordDeleteOutcome,} from '../../lib'
    import {recordSaveSucceeded} from '../../lib'
    import EditEventInspector from './EditEventInspector.svelte'
    import type {DataRecordId} from "@cozemble/model-core";

    export const ssr = false

    let models: Model[]
    let model: Model | null = null
    let records: DataRecord[] = []
    let editContexts: RecordEditContext[] = []

    onMount(() => {
        registerAllProperties()
        registerAllPropertyViewers()
        registerAllPropertyEditors()
        const localStored = localStorage.getItem(pageEditorLocalStorageKey)
        if (localStored) {
            models = JSON.parse(localStored) as Model[]
            model = models[0]
            console.log('Loaded model from local storage', model)
        } else {
            models = [...allModels]
            model = invoiceModel
        }
    })

    const editRecordListener: EditRecordListener = {
        beginEdit(context: RecordEditContext) {
            editContexts = [...editContexts, context]
        },
        popEdit() {
            editContexts = editContexts.slice(0, editContexts.length - 1)
        },
        onEvent: (context: RecordEditContext, _event: DataRecordEditEvent) => {
            editContexts = [...editContexts.slice(0, editContexts.length - 1), context]
        },
    }

    setEditRecordListener(setContext, editRecordListener)


    const noOpEditorHost: PaginatedEditorHost = {
        async recordEdited(
            editedRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            records = records.map((r) =>
                r.id.value === editedRecord.record.id.value ? editedRecord.record : r,
            )
            return recordSaveSucceeded(editedRecord.record)
        },

        async saveNewRecord(
            newRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            records = [...records, newRecord.record]
            return recordSaveSucceeded(newRecord.record)
        },

        async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
            records = records.filter((r) => r.id.value !== record.id.value)
            return recordSaveSucceeded(record)
        },
        async searchRecords(
            _modelId: ModelId,
            _search: string,
        ): Promise<DataRecord[]> {
            return []
        },
        async recordById(_modelId: ModelId, _recordId: DataRecordId): Promise<DataRecord | null> {
            return null
        },
    }

</script>

<div class="bg-base-100 rounded-lg">

    {#if model}
        <PaginatedEditor {models} {model} {records} modelViews={[]} paginatedEditorHost={noOpEditorHost}/>
    {/if}

    <EditEventInspector {editContexts}/>
</div>
