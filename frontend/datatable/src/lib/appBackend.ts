import { type Backend, notImplementedBackend } from './backend/Backend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { RecordsContext } from './records/RecordsContext'
import type { ModelId } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import type { SystemConfiguration } from '@cozemble/model-core'

let backend = notImplementedBackend

export const backendFns = {
  setBackend: (newBackend: Backend) => {
    backend = newBackend
  },
}

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  return backend.saveModels(models)
}

export function recordsContext(
  systemConfiguration: SystemConfiguration,
  models: Writable<EventSourcedModel[]>,
  modelId: ModelId,
): RecordsContext {
  return new RecordsContext(backend, systemConfiguration, modelId, models)
}
