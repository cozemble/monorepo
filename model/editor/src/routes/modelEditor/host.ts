import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { modelIdFns } from '@cozemble/model-core'
import type { EventSourcedModelList } from '@cozemble/model-event-sourced'
import {
  type EventSourcedModel,
  eventSourcedModelFns,
  eventSourcedModelListEvents,
  eventSourcedModelListFns,
} from '@cozemble/model-event-sourced'
import type { ModelEditorHost } from '$lib/ModelEditorHost'
import { mandatory } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import { type Writable, writable } from 'svelte/store'

export const modelList: Writable<EventSourcedModelList> = writable(
  eventSourcedModelListFns.newInstance(),
)
const storageKey = 'com.cozemble.model.editor.route.page'

export const host: ModelEditorHost = {
  modelChanged: function (id: ModelId, event: ModelEvent) {
    modelList.update((list) => {
      return eventSourcedModelListFns.addModelEvent(list, event)
    })
  },

  modelAdded(model: Model) {
    modelList.update((list) =>
      eventSourcedModelListFns.addEvent(list, eventSourcedModelListEvents.addModel(model)),
    )
  },

  modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel {
    return mandatory(
      allModels.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id}`,
    )
  },
}

export function clearLocalStorage(localStorage: Storage) {
  localStorage.removeItem(storageKey)
  modelList.set(
    eventSourcedModelListFns.newInstance([
      eventSourcedModelFns.newInstance(modelFns.newInstance('My model')),
    ]),
  )
}

let localStorageSubscribed = false

export function bootstrapHost(localStorage: Storage) {
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    modelList.set(JSON.parse(stored))
  } else {
    modelList.set(
      eventSourcedModelListFns.newInstance([
        eventSourcedModelFns.newInstance(modelFns.newInstance('My model')),
      ]),
    )
  }
  if (!localStorageSubscribed) {
    modelList.subscribe((models) => localStorage.setItem(storageKey, JSON.stringify(models)))
    localStorageSubscribed = true
  }
}
