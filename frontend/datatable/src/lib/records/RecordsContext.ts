import type {
  Cardinality,
  DataRecord,
  DataRecordId,
  DataRecordPathParentElement,
  LeafModelSlot,
  Model,
  ModelEvent,
  ModelId,
  NestedModel,
  SystemConfiguration,
} from '@cozemble/model-core'
import { modelIdAndNameFns, nestedModelNameFns } from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, type Readable, type Writable, writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { coreModelEvents, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { mandatory } from '@cozemble/lang-util'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { DataRecordPathFocus, recordSaveSucceeded } from '@cozemble/data-paginated-editor'
import type { DataRecordEditEvent, EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import { dataRecordFns, dataRecordValuePathFns, modelFns } from '@cozemble/model-api'
import {
  DataTableFocus,
  type DataTableFocusControls,
  emptyDataTableFocus,
} from '../focus/DataTableFocus'
import { gettableWritable } from '../editors/GettableWritable'
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk/dist/esm'

export type LoadingState = 'loading' | 'loaded'

export interface RecordsContext {
  saveNewModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  updateModel(modelId: ModelId, event: ModelEvent): Promise<void>

  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void

  modelEdited(model: EventSourcedModel): Promise<void>

  nestedContext(record: DataRecord, model: NestedModel): RecordsContext

  addNestedModel(model: Model, cardinality: Cardinality): Promise<void>

  records(): Readable<DataRecord[]>

  modelId(): ModelId

  model(): Readable<EventSourcedModel>

  getFocus(): Readable<DataTableFocus>

  getFocusControls(): DataTableFocusControls

  allModels(): Readable<Model[]>

  findModelById(modelId: ModelId): Model

  loadingState(): Readable<LoadingState>

  allEventSourcedModels(): Readable<EventSourcedModel[]>

  getDataRecordPathParentElements(): DataRecordPathParentElement[]

  getDirtyRecords(): Readable<DataRecordId[]>
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
    private readonly systemConfigurationProvider: () => SystemConfiguration,
    private readonly _onError: (error: JustErrorMessage) => void,
    private readonly _modelId: ModelId,
    private readonly _allEventSourcedModels: Writable<EventSourcedModel[]>,
    private readonly _focus = gettableWritable(
      emptyDataTableFocus(() => this._records.get().map((r) => r.record)),
    ),
    private readonly _model = derived(_allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === _modelId.value),
        `Model ${_modelId} not found`,
      ),
    ),
    private readonly _loadingState = writable('loading' as LoadingState),
    private readonly _records = gettableWritable([] as EventSourcedDataRecord[]),
    private _allModelCache: Model[] = [],
    private readonly _allModels = derived(_allEventSourcedModels, (models) => {
      this._allModelCache = models.map((m) => m.model)
      return this._allModelCache
    }),
    private readonly _recordStore = derived(_records, (records) => records.map((r) => r.record)),
    private readonly recordSaveTimestamps = new Map<string, number>(),
    private readonly dirtyRecords = derived(_records, (records) =>
      records
        .filter((r) => {
          const lastSaveTimestamp = recordSaveTimestamps.get(r.record.id.value) ?? 0
          return r.events.some((e) => e.timestamp.value > lastSaveTimestamp)
        })
        .map((r) => r.record.id),
    ),
  ) {}

  _recordsProvider: () => DataRecord[] = () => this._records.get().map((r) => r.record)

  getDataRecordPathParentElements() {
    return []
  }

  getDirtyRecords(): Readable<DataRecordId[]> {
    return this.dirtyRecords
  }

  modelId() {
    return this._modelId
  }

  getFocus(): Readable<DataTableFocus> {
    return this._focus
  }

  getFocusControls(): DataTableFocusControls {
    const focus = this._focus
    const focusValue = focus.get()
    const recordsProvider = this._recordsProvider
    const models = this._allModelCache
    const systemConfiguration = this.systemConfigurationProvider()

    return {
      keydown: (event: KeyboardEvent) => {
        if (!focusValue.isEditing && event.key === 'Enter') {
          event.stopPropagation()
          event.preventDefault()
          focus.update((f) => f.beginEditing())
        }
      },
      setFocus(rowIndex: number, slot: LeafModelSlot) {
        focus.update((f) =>
          f.setFocus(
            rowIndex,
            new DataRecordPathFocus(
              models,
              () => recordsProvider()[rowIndex],
              systemConfiguration,
              dataRecordValuePathFns.newInstance(slot),
            ),
          ),
        )
      },
      moveForward() {
        focus.update((f) => f.moveForward())
      },
    }
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
    this._records.set(
      loaded.map((r) => eventSourcedDataRecordFns.fromRecord(this._allModelCache, r)),
    )
    this._loadingState.set('loaded')
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const outcome = await this.backend.saveNewRecord(newRecord)
    if (outcome._type === 'record.save.succeeded') {
      this._records.update((records) => [...records, newRecord])
    }
    return outcome
  }

  async saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const outcome = await this.backend.saveExistingRecord(record)
    if (outcome._type === 'record.save.succeeded') {
      this._records.update((records) =>
        records.map((r) => (r.record.id.value === record.record.id.value ? record : r)),
      )
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

  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void {
    this._records.update((records) => {
      const record = records.find((r) => r.record.id.value === recordId.value)
      if (record === undefined) {
        throw new Error(`Record ${recordId} not found`)
      }
      const mutated = eventSourcedDataRecordFns.addEvent(
        this.systemConfigurationProvider(),
        event,
        record,
      )
      return records.map((r) => (r.record.id.value === recordId.value ? mutated : r))
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
      [...this.getDataRecordPathParentElements(), nestedModel],
      this._onError,
      this._allEventSourcedModels,
      this._allModels,
      nestedModel,
      maybeRecords,
    )
  }

  records(): Readable<DataRecord[]> {
    return this._recordStore
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
    private readonly _parentElements: DataRecordPathParentElement[],
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

  getDirtyRecords(): Readable<DataRecordId[]> {
    return this.parent.getDirtyRecords()
  }

  getDataRecordPathParentElements() {
    return this._parentElements
  }

  getFocus() {
    return this.parent.getFocus()
  }

  getFocusControls(): DataTableFocusControls {
    return this.parent.getFocusControls()
  }

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

  async saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    this._recordsStore.update((records) =>
      records.map((r) => (r.id.value === record.record.id.value ? record.record : r)),
    )
    return recordSaveSucceeded(record.record)
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    return this.parent.updateModel(modelId, event)
  }

  updateRecord(recordId: DataRecordId, event: DataRecordEditEvent): void {
    return this.parent.updateRecord(recordId, event)
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
      [...this.getDataRecordPathParentElements(), nestedModel],
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
