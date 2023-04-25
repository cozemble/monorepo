import { type Backend, notImplementedBackend } from './backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'

let backend = notImplementedBackend

export const backendFns = {
  setBackend: (newBackend: Backend) => {
    backend = newBackend
  },
}

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  console.log({ model })
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  return backend.saveModels(models)
}
