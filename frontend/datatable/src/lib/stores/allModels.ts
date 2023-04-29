import { eventSourcedStore } from './EventSourcedStore'
import { tablesActionReducer } from '../tables/actions'
import { saveModels } from '../appBackend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { derived } from 'svelte/store'

export const allEventSourcedModels = eventSourcedStore(
  tablesActionReducer,
  saveModels,
  [] as EventSourcedModel[],
)

export const allTopLevelEventSourcedModels = derived(allEventSourcedModels, (models) => {
  return models.filter((model) => !model.model.parentModelId)
})

export const allModels = derived(allEventSourcedModels, (models) => {
  return models.map((model) => model.model)
})
