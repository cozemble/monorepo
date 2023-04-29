import type {
  Cardinality,
  DataRecord,
  Model,
  ModelEvent,
  ModelId,
  NestedModel,
} from '@cozemble/model-core'
import { modelIdAndNameFns, nestedModelNameFns } from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, type Readable, type Writable, writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { coreModelEvents, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { mandatory } from '@cozemble/lang-util'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import { dataRecordFns, modelFns } from '@cozemble/model-api'

export type LoadingState = 'loading' | 'loaded'

export interface RecordsContext {
  saveNewModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  updateModel(modelId: ModelId, event: ModelEvent): Promise<void>

  modelEdited(model: EventSourcedModel): Promise<void>

  nestedContext(record: DataRecord, model: NestedModel): RecordsContext

  addNestedModel(model: Model, cardinality: Cardinality): Promise<void>

  records(): Readable<DataRecord[]>

  modelId(): ModelId

  model(): Readable<EventSourcedModel>

  allModels(): Readable<Model[]>

  findModelById(modelId: ModelId): Model

  loadingState(): Readable<LoadingState>

  allEventSourcedModels(): Readable<EventSourcedModel[]>
}

async function addNestedModelFn(
  onError: (e: JustErrorMessage) => void,
  context: RecordsContext,
  model: Model,
  cardinality: Cardinality,
): Promise<void> {
  model.parentModelId = context.modelId()
  const saveModelOutcome = await context.saveNewModel(eventSourcedModelFns.newInstance(model))
  if (saveModelOutcome) {
    onError(saveModelOutcome)
    return
  }
  const parent = modelIdAndNameFns.fromModel(context.findModelById(context.modelId()))
  const child = modelIdAndNameFns.fromModel(model)
  const name =
    cardinality === 'one'
      ? nestedModelNameFns.newInstance(model.name.value)
      : nestedModelNameFns.newInstance(model.pluralName.value)
  const event = coreModelEvents.nestedModelAdded(parent, child, cardinality, name)
  await context.updateModel(context.modelId(), event)
}

export class RootRecordsContext implements RecordsContext {
  constructor(
    private readonly backend: Backend,
    private readonly _onError: (error: JustErrorMessage) => void,
    private readonly _modelId: ModelId,
    private readonly _allEventSourcedModels: Writable<EventSourcedModel[]>,
    private readonly _model = derived(_allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === _modelId.value),
        `Model ${_modelId} not found`,
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

  modelId() {
    return this._modelId
  }

  findModelById(modelId: ModelId): Model {
    return modelFns.findById(this._allModelCache, modelId)
  }

  async saveNewModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    return this.backend.saveModel(model)
  }

  async addNestedModel(model: Model, cardinality: Cardinality): Promise<void> {
    return addNestedModelFn(this._onError, this, model, cardinality)
  }

  async loadRecords(): Promise<void> {
    this._loadingState.set('loading')
    const loaded = await this.backend.getRecords(this.modelId())
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
    return new NestedRecordsContext(
      this,
      this._onError,
      this._allEventSourcedModels,
      this._allModels,
      nestedModel,
      maybeRecords,
    )
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
    private readonly parent: RecordsContext,
    private readonly _onError: (error: JustErrorMessage) => void,
    private readonly _allEventSourcedModels: Writable<EventSourcedModel[]>,
    private readonly _allModels: Readable<Model[]>,
    public readonly nestedModel: NestedModel,
    private readonly _records: DataRecord[],
    private readonly _recordsStore = writable(_records),
    private readonly _model = derived(_allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === nestedModel.modelId.value),
        `Model ${nestedModel.modelId.value} not found`,
      ),
    ),
    private readonly _loadingState = writable('loading' as LoadingState),
  ) {}

  modelId() {
    return this.nestedModel.modelId
  }

  findModelById(modelId: ModelId): Model {
    return this.parent.findModelById(modelId)
  }

  async saveNewModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    return this.parent.saveNewModel(model)
  }

  async addNestedModel(model: Model, cardinality: Cardinality): Promise<void> {
    return addNestedModelFn(this._onError, this, model, cardinality)
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    this._recordsStore.update((records) => [...records, newRecord.record])
    return recordSaveSucceeded(newRecord.record)
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    return this.parent.updateModel(modelId, event)
  }

  async modelEdited(model: EventSourcedModel): Promise<void> {
    return this.parent.modelEdited(model)
  }

  nestedContext(record: DataRecord, nestedModel: NestedModel): RecordsContext {
    let maybeRecords = record.values[nestedModel.id.value] as DataRecord[]
    if (maybeRecords === undefined) {
      if (nestedModel.cardinality === 'many') {
        maybeRecords = []
      } else {
        const model = this.findModelById(nestedModel.modelId)
        maybeRecords = [dataRecordFns.newInstance(model, record.createdBy.value)]
      }
    }
    return new NestedRecordsContext(
      this,
      this._onError,
      this._allEventSourcedModels,
      this._allModels,
      nestedModel,
      maybeRecords,
    )
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
