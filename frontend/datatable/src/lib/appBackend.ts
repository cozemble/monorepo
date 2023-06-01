import { type Backend, type FilterParams, notImplementedBackend } from './backend/Backend'
import type { EventSourcedModel, EventSourcedRecordGraph } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { ModelId } from '@cozemble/model-core'
import { makeStoreSyncBackend } from '$lib/app/StoreSyncBackend'

export let backend = notImplementedBackend

export const backendFns = {
  setBackend: (newBackend: Backend) => {
    backend = makeStoreSyncBackend(newBackend)
    return backend
  },
}

export async function getRecordsForModel(
  modelId: ModelId,
  filterParams: FilterParams,
): Promise<EventSourcedRecordGraph> {
  return backend.getRecords(modelId, filterParams)
}

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  return backend.saveModels(models)
}

export const defaultOnError = (error: JustErrorMessage) => {
  console.error(error)
}
