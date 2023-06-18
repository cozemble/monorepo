import { eventSourcedStore } from './EventSourcedStore'
import { saveModels } from '../appBackend'
import type {
  EventSourcedModel,
  EventSourcedModelList,
  EventSourcedModelListEvent,
} from '@cozemble/model-event-sourced'
import { eventSourcedModelListFns } from '@cozemble/model-event-sourced'
import { derived } from 'svelte/store'
import type { EventSourcedModelStore } from '../types'

function reducer(
  list: EventSourcedModelList,
  event: EventSourcedModelListEvent,
): EventSourcedModelList {
  return eventSourcedModelListFns.addEvent(list, event)
}

export let allEventSourcedModels: EventSourcedModelStore = eventSourcedStore(
  reducer,
  (list) => saveModels(list.models),
  eventSourcedModelListFns.newInstance(),
)

export function setAllEventSourcedModels(models: EventSourcedModelStore) {
  allEventSourcedModels = models
  allTopLevelEventSourcedModels = derived(allEventSourcedModels, (list) => {
    return list.models.filter((model) => !model.model.parentModelId)
  })
  allModels = derived(allEventSourcedModels, (list) => {
    return list.models.map((model) => model.model)
  })
}

export function eventSourcedModelStore(models: EventSourcedModel[]) {
  return eventSourcedStore(
    reducer,
    (list) => saveModels(list.models),
    eventSourcedModelListFns.newInstance(models),
  )
}

export let allTopLevelEventSourcedModels = derived(allEventSourcedModels, (list) => {
  return list.models.filter((model) => !model.model.parentModelId)
})

export let allModels = derived(allEventSourcedModels, (list) => {
  return list.models.map((model) => model.model)
})
