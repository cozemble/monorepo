import type {
  Cardinality,
  DataRecord,
  ModelEvent,
  ModelId,
  ModelPathElement,
  NestedModel,
  SystemConfiguration,
} from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, writable, type Writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'

export type LoadingState = 'loading' | 'loaded'

export interface PaginatedRecords {
  records: DataRecord[]
}

function emptyPaginatedRecords(): PaginatedRecords {
  return {
    records: [],
  }
}

export class RecordsContext {
  constructor(
    private readonly backend: Backend,
    public readonly systemConfiguration: SystemConfiguration,
    private readonly modelId: ModelId,
    public readonly allEventSourcedModels: Writable<EventSourcedModel[]>,
    private readonly parentElements: ModelPathElement[],
    public readonly cardinality: Cardinality = 'many',
    public readonly model = derived(allEventSourcedModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === modelId.value),
        `Model ${modelId} not found`,
      ),
    ),
    public readonly loadingState = writable('loading' as LoadingState),
    public readonly records = writable(emptyPaginatedRecords()),
    public readonly allModels = derived(allEventSourcedModels, (models) =>
      models.map((m) => m.model),
    ),
  ) {}

  public async loadRecords(): Promise<void> {
    this.loadingState.set('loading')
    const loaded = await this.backend.getRecords(this.modelId)
    this.records.set({ records: loaded })
    this.loadingState.set('loaded')
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    return this.backend.saveNewRecord(newRecord)
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    this.allEventSourcedModels.update((models) => {
      const model = eventSourcedModelFns.findById(models, modelId)
      const mutated = eventSourcedModelFns.addEvent(model, event)
      return models.map((model) => (model.model.id.value === modelId.value ? mutated : model))
    })
  }

  async modelEdited(model: EventSourcedModel): Promise<void> {
    this.allEventSourcedModels.update((models) => {
      return models.map((m) => (m.model.id.value === model.model.id.value ? model : m))
    })
  }

  nestedContext(model: NestedModel): RecordsContext {
    return new RecordsContext(
      this.backend,
      this.systemConfiguration,
      model.modelId,
      this.allEventSourcedModels,
      [...this.parentElements, model],
    )
  }
}
