import type { DataRecord, ModelEvent, ModelId, SystemConfiguration } from '@cozemble/model-core'
import type { Backend } from '../backend/Backend'
import { derived, writable, type Writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util'

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
    private readonly allModels: Writable<EventSourcedModel[]>,
    public readonly model = derived(allModels, (models) =>
      mandatory(
        models.find((model) => model.model.id.value === modelId.value),
        `Model ${modelId} not found`,
      ),
    ),
    public readonly loadingState = writable('loading' as LoadingState),
    public readonly records = writable(emptyPaginatedRecords()),
  ) {}

  public async loadRecords(): Promise<void> {
    this.loadingState.set('loading')
    const loaded = await this.backend.getRecords(this.modelId)
    this.records.set({ records: loaded })
    this.loadingState.set('loaded')
  }

  async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
    this.allModels.update((models) => {
      const model = eventSourcedModelFns.findById(models, modelId)
      const mutated = eventSourcedModelFns.addEvent(model, event)
      return models.map((model) => (model.model.id.value === modelId.value ? mutated : model))
    })
  }
}
