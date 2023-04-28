import type { DataRecord, ModelEvent, ModelId, NestedModel } from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, type Readable, type Writable, writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { Model } from '@cozemble/model-core/dist/esm'

export type LoadingState = 'loading' | 'loaded'

export interface PaginatedRecords {
  records: DataRecord[]
}

function emptyPaginatedRecords(): PaginatedRecords {
  return {
    records: [],
  }
}

export interface RecordsContext {
  loadRecords(): Promise<void>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  updateModel(modelId: ModelId, event: ModelEvent): Promise<void>

  modelEdited(model: EventSourcedModel): Promise<void>

  nestedContext(model: NestedModel): RecordsContext

  records(): Readable<PaginatedRecords>

  model(): Readable<EventSourcedModel>

  allModels(): Readable<Model[]>

  loadingState(): Readable<LoadingState>

  allEventSourcedModels(): Readable<EventSourcedModel[]>
}

export class RootRecordsContext implements RecordsContext {
  constructor(
    private readonly backend: Backend,
    private readonly modelId: ModelId,
    private readonly _allEventSourcedModels: Writable<EventSourcedModel[]>,
    private readonly _model = derived(_allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === modelId.value),
        `Model ${modelId} not found`,
      ),
    ),
    private readonly _loadingState = writable('loading' as LoadingState),
    private readonly _records = writable(emptyPaginatedRecords()),
    private readonly _allModels = derived(_allEventSourcedModels, (models) =>
      models.map((m) => m.model),
    ),
  ) {}

  async loadRecords(): Promise<void> {
    this._loadingState.set('loading')
    const loaded = await this.backend.getRecords(this.modelId)
    this._records.set({ records: loaded })
    this._loadingState.set('loaded')
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const outcome = await this.backend.saveNewRecord(newRecord)
    if (outcome._type === 'record.save.succeeded') {
      this._records.update((records) => {
        return {
          records: [...records.records, outcome.record],
        }
      })
    }
    return outcome
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    this._allEventSourcedModels.update((models) => {
      const model = eventSourcedModelFns.findById(models, modelId)
      const mutated = eventSourcedModelFns.addEvent(model, event)
      return models.map((model) => (model.model.id.value === modelId.value ? mutated : model))
    })
  }

  async modelEdited(model: EventSourcedModel): Promise<void> {
    this._allEventSourcedModels.update((models) => {
      return models.map((m) => (m.model.id.value === model.model.id.value ? model : m))
    })
  }

  nestedContext(model: NestedModel): RecordsContext {
    return new RootRecordsContext(this.backend, model.modelId, this._allEventSourcedModels)
  }

  records(): Readable<PaginatedRecords> {
    return this._records
  }

  model(): Readable<EventSourcedModel> {
    return this._model
  }

  allModels(): Readable<Model[]> {
    return this._allModels
  }

  loadingState(): Readable<LoadingState> {
    return this._loadingState
  }

  allEventSourcedModels(): Readable<EventSourcedModel[]> {
    return this._allEventSourcedModels
  }
}
