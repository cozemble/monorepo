import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { modelNameFns } from '@cozemble/model-core'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelEditorHost } from '$lib/ModelEditorHost'
import { mandatory } from '@cozemble/lang-util'
import { modelIdFns } from '@cozemble/model-api'
import { writable } from 'svelte/store'
import {
  type EventSourcedModelGraph,
  eventSourcedModelGraphFns,
  modelGraphEvents,
} from '@cozemble/model-event-sourced'

// export const allModels: Writable<EventSourcedModel[]> = writable([])
export const modelGraph = writable(eventSourcedModelGraphFns.newInstance())
const storageKey = 'com.cozemble.model.editor.route.page'

export const host: ModelEditorHost = {
  modelChanged(id: ModelId, event: ModelEvent) {
    modelGraph.update((graph) => eventSourcedModelGraphFns.applyModelEvent(graph, event))
  },

  modelAdded(model: Model) {
    modelGraph.update((graph) =>
      eventSourcedModelGraphFns.applyModelGraphEvent(graph, modelGraphEvents.addModel(model)),
    )
  },

  modelWithId(graph: EventSourcedModelGraph, id: ModelId): EventSourcedModel {
    return mandatory(
      graph.models.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id}`,
    )
  },
}

export function clearLocalStorage(localStorage: Storage) {
  localStorage.removeItem(storageKey)
  modelGraph.set(
    eventSourcedModelGraphFns.newInstance([
      eventSourcedModelFns.newInstance(modelNameFns.newInstance('My model')),
    ]),
  )
}

let localStorageSubscribed = false

export function bootstrapHost(localStorage: Storage) {
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    modelGraph.set(JSON.parse(stored))
  } else {
    modelGraph.set(
      eventSourcedModelGraphFns.newInstance([
        eventSourcedModelFns.newInstance(modelNameFns.newInstance('My model')),
      ]),
    )
  }
  if (!localStorageSubscribed) {
    modelGraph.subscribe((graph) => localStorage.setItem(storageKey, JSON.stringify(graph)))
    localStorageSubscribed = true
  }
}
