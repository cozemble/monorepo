<script lang="ts">
    import type {
        AttachmentIdAndFileName,
        DataRecordEditEvent,
        EventSourcedDataRecord,
        UploadedAttachment,
    } from '@cozemble/data-editor-sdk'
    import type {DataRecord, DataRecordId, Model, ModelId, ModelView} from '@cozemble/model-core'
    import {systemConfigurationFns} from "@cozemble/model-core";
    import PaginatedEditor from '../../lib/PaginatedEditor.svelte'
    import {onMount, setContext} from 'svelte'
    import {registerAllProperties, registerAllSlotEditors, registerAllSlotViewers,} from '@cozemble/model-assembled'
    import {pageEditorLocalStorageKey} from './context'
    import {allModels, invoiceModel} from '../testModels'
    import type {EditRecordListener} from '../../lib/EditRecordListener'
    import {setEditRecordListener} from '../../lib/EditRecordListener'
    import type {PaginatedEditorHost, RecordDeleteOutcome, RecordEditContext, RecordSaveOutcome,} from '../../lib'
    import {recordSaveSucceeded} from '../../lib'
    import EditEventInspector from './EditEventInspector.svelte'
    import type {JustErrorMessage} from "@cozemble/lang-util";

    export const ssr = false

    let models: Model[]
    let model: Model | null = null
    let records: DataRecord[] = []
    let editContexts: RecordEditContext[] = []
    const systemConfiguration = systemConfigurationFns.empty()

    onMount(() => {
        registerAllProperties()
        registerAllSlotViewers()
        registerAllSlotEditors()
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
        viewRecord(record: DataRecord, viewNow: boolean): void {
            console.log('View record', record, viewNow)
        },
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
        async uploadAttachments(
            _files: File[],
            _progressUpdater: (percent: number) => void,
        ): Promise<UploadedAttachment[]> {
            return [] as UploadedAttachment[]
        },
        async deleteAttachments(_attachmentIds: string[]): Promise<void> {
            throw new Error('Not implemented')
        },

        async getAttachmentViewUrls(_attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
            throw new Error('Not implemented')
        },
        instructUser() {
            throw new Error('Not implemented')
        },
        getModelViews(modelId: ModelId): ModelView[] {
            throw new Error('Not implemented')
        },
        saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
            throw new Error('Not implemented')
        }

    }

</script>

<div class="bg-base-100 rounded-lg">

    {#if model}
        <PaginatedEditor {systemConfiguration} {models} {model} {records} modelViews={[]}
                         paginatedEditorHost={noOpEditorHost}/>
    {/if}

    <EditEventInspector {editContexts}/>
</div>
