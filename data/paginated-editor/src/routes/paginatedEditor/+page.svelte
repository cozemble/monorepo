<script lang="ts">
    import type {DataRecord, Model} from '@cozemble/model-core'
    import PaginatedEditor from '$lib/PaginatedEditor.svelte'
    import {onMount, setContext} from 'svelte'
    import {
        registerAllProperties,
        registerAllPropertyEditors,
        registerAllPropertyViewers,
    } from '@cozemble/model-assembled'
    import {pageEditorLocalStorageKey} from './context'
    import {allModels, invoiceModel} from '../testModels'
    import type {EditRecordListener} from '$lib/EditRecordListener'
    import {setEditRecordListener} from '$lib/EditRecordListener'
    import type {RecordEditContext, RecordSaveOutcome,} from '$lib/RecordEditContext'
    import {recordSaveFailed, recordSaveSucceeded} from '$lib/RecordEditContext'
    import type {DataRecordEditEvent, EventSourcedDataRecord,} from '@cozemble/data-editor-sdk'
    import EditEventInspector from './EditEventInspector.svelte'
    import type {PaginatedEditorHost} from '$lib/PaginatedEditorHost'
    import {AxiosGraphQlClient} from '@cozemble/graphql-client'
    import {hasuraMutationFromEvents} from '@cozemble/data-hasura-mutations'
    import {modelLevelHasuraErrors} from './recordPathErrorsFromHasuraError'
    import {dataRecordFns} from "@cozemble/model-api";

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

    const localHasuraClient = new AxiosGraphQlClient(
        'http://localhost:8080/v1/graphql',
    )
    const localHasuraEditorHost: PaginatedEditorHost = {
        async recordEdited(
            editedRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            throw new Error('Not implemented')
        },

        async saveNewRecord(
            newRecord: EventSourcedDataRecord,): Promise<RecordSaveOutcome> {
            const mutation = hasuraMutationFromEvents(models, dataRecordFns.childRecords(models, newRecord.record), newRecord.record,
                newRecord.events,
            )
            try {
                const outcome = await localHasuraClient.execute(mutation)
                console.log('Outcome', outcome)
                if (outcome._type === 'gql.data') {
                    records = [...records, newRecord.record]
                    return recordSaveSucceeded(newRecord.record)
                }
                return recordSaveFailed(modelLevelHasuraErrors(outcome.errors), new Map())
            } catch (e: any) {
                console.error(e)
                return recordSaveFailed([e.message], new Map())
            }
        },
    }

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
    }

    let selectedHost = noOpEditorHost

    const paginatedEditorHost: PaginatedEditorHost = {
        async recordEdited(
            editedRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            return selectedHost.recordEdited(editedRecord)
        },

        async saveNewRecord(
            newRecord: EventSourcedDataRecord,
        ): Promise<RecordSaveOutcome> {
            return selectedHost.saveNewRecord(newRecord)
        },
    }

    function persistenceMethodChanged(event: Event) {
        const target = event.target as HTMLInputElement
        const value = target.value
        if (value === 'localHasura') {
            selectedHost = localHasuraEditorHost
        } else {
            selectedHost = noOpEditorHost
        }
    }
</script>

<div class="bg-base-100 rounded-lg" on:change={persistenceMethodChanged}>
    <div class="form-control w-full max-w-xs">
        <label for="persistenceSelect" class="label">Persistence method</label><br
    />

        <select id="persistenceSelect" class="select select-bordered">
            <option selected={selectedHost === noOpEditorHost}>------</option>
            <option
                    value="localHasura"
                    selected={selectedHost === localHasuraEditorHost}
            >Local Hasura (http://localhost:8080/v1/graphql)
            </option>
        </select>
    </div>

    {#if model}
        <PaginatedEditor {models} {model} {records} {paginatedEditorHost}/>
    {/if}

    <EditEventInspector {editContexts}/>
</div>
