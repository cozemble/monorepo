import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { DataRecord, ModelId } from '@cozemble/model-core'

export interface Backend {
  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>

  getRecords(modelId: ModelId): Promise<DataRecord[]>
}

export const notImplementedBackend: Backend = {
  saveModel: async (model) => {
    throw new Error('Not implemented')
  },
  saveModels: async (models) => {
    throw new Error('Not implemented')
  },
  getRecords: async (modelId) => {
    throw new Error('Not implemented')
  },
}
