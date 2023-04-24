import { notImplementedBackend } from './backend/Backend'
import { writable } from 'svelte/store'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'

let backend = notImplementedBackend
export const backendStore = writable(backend)
backendStore.subscribe((value) => {
  backend = value
})

export async function saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
  return backend.saveModel(model)
}

export async function saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
  return backend.saveModels(models)
}
