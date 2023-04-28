import type {
  Cardinality,
  DataRecord,
  Model,
  ModelEvent,
  ModelId,
  NestedModel,
} from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, readable, type Readable, type Writable, writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import { dataRecordFns } from '@cozemble/model-api'
import { modelFns } from '@cozemble/model-api/dist/esm'

export type LoadingState = 'loading' | 'loaded'

export interface RecordsContext {
  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  updateModel(modelId: ModelId, event: ModelEvent): Promise<void>

  modelEdited(model: EventSourcedModel): Promise<void>

  nestedContext(record: DataRecord, model: NestedModel): RecordsContext

  records(): Readable<DataRecord[]>

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
    private readonly _records = writable([] as DataRecord[]),
    private _allModelCache: Model[] = [],
    private readonly _allModels = derived(_allEventSourcedModels, (models) => {
      this._allModelCache = models.map((m) => m.model)
      return this._allModelCache
    }),
  ) {}

  async loadRecords(): Promise<void> {
    this._loadingState.set('loading')
    const loaded = await this.backend.getRecords(this.modelId)
    this._records.set(loaded)
    this._loadingState.set('loaded')
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const outcome = await this.backend.saveNewRecord(newRecord)
    if (outcome._type === 'record.save.succeeded') {
      this._records.update((records) => [...records, outcome.record])
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

  nestedContext(record: DataRecord, nestedModel: NestedModel): RecordsContext {
    let maybeRecords = record.values[nestedModel.id.value] as DataRecord[]
    if (maybeRecords === undefined) {
      if (nestedModel.cardinality === 'many') {
        maybeRecords = []
      } else {
        const model = modelFns.findById(this._allModelCache, nestedModel.modelId)
        maybeRecords = [dataRecordFns.newInstance(model, record.createdBy.value)]
      }
    }
    return new NestedRecordsContext(this._allEventSourcedModels, nestedModel, maybeRecords)
  }

  records(): Readable<DataRecord[]> {
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

export class NestedRecordsContext implements RecordsContext {
  constructor(
    private readonly _allEventSourcedModels: Writable<EventSourcedModel[]>,
    public readonly nestedModel: NestedModel,
    private readonly _records: DataRecord[],
    private readonly _recordsStore = readable(_records),
    private readonly _model = derived(_allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === nestedModel.modelId.value),
        `Model ${nestedModel.modelId.value} not found`,
      ),
    ),
    private readonly _allModels = derived(_allEventSourcedModels, (models) =>
      models.map((m) => m.model),
    ),
    private readonly _loadingState = writable('loading' as LoadingState),
  ) {}

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    throw new Error('Method not implemented.')
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    throw new Error('Method not implemented.')
  }

  async modelEdited(model: EventSourcedModel): Promise<void> {
    throw new Error('Method not implemented.')
  }

  nestedContext(record: DataRecord, model: NestedModel): RecordsContext {
    throw new Error('Method not implemented.')
  }

  records(): Readable<DataRecord[]> {
    return this._recordsStore
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
