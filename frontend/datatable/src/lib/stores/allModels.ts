import { eventSourcedStore } from './EventSourcedStore'
import { tablesActionReducer } from '../tables/actions'
import { saveModels } from '../appBackend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { derived } from 'svelte/store'
import type { EventSourcedModelStore } from '../types'

export let allEventSourcedModels: EventSourcedModelStore = eventSourcedStore(
  tablesActionReducer,
  saveModels,
  [] as EventSourcedModel[],
)

export function setAllEventSourcedModels(models: EventSourcedModelStore) {
  allEventSourcedModels = models
  allTopLevelEventSourcedModels = derived(allEventSourcedModels, (models) => {
    return models.filter((model) => !model.model.parentModelId)
  })
  allModels = derived(allEventSourcedModels, (models) => {
    return models.map((model) => model.model)
  })
}

export function eventSourcedModelStore(models: EventSourcedModel[]) {
  return eventSourcedStore(tablesActionReducer, saveModels, models)
}

export let allTopLevelEventSourcedModels = derived(allEventSourcedModels, (models) => {
  return models.filter((model) => !model.model.parentModelId)
})

export let allModels = derived(allEventSourcedModels, (models) => {
  return models.map((model) => model.model)
})
