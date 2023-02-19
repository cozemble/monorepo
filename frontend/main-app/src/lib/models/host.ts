import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util'
import { modelIdFns } from '@cozemble/model-api'
import { type Writable, writable } from 'svelte/store'
import type { ModelEditorHost } from '@cozemble/model-editor'
import type { HttpHandler } from '@http4t/core/contract'

export const allModels: Writable<EventSourcedModel[]> = writable([])

export const host: ModelEditorHost = {
  modelChanged(id: ModelId, event: ModelEvent) {
    allModels.update((models) => {
      return models.map((model) => {
        if (modelIdFns.equals(model.model.id, id)) {
          return eventSourcedModelFns.addEvent(model, event)
        } else {
          return model
        }
      })
    })
  },

  modelAdded(model: Model) {
    allModels.update((models) => [...models, eventSourcedModelFns.newInstance(model)])
  },

  modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel {
    return mandatory(
      allModels.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id}`,
    )
  },
}

export function bootstrapHost() {
  allModels.set([])
  // const stored = localStorage.getItem(storageKey)
  // if (stored) {
  //   allModels.set(JSON.parse(stored))
  // }
}
