import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'

export interface Backend {
  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>
}

export const notImplementedBackend: Backend = {
  saveModel: async (model) => {
    throw new Error('Not implemented')
  },
  saveModels: async (models) => {
    throw new Error('Not implemented')
  },
}
