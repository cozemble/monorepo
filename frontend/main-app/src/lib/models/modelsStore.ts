import { modelFns, modelIdFns } from '@cozemble/model-api'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { ModelEditorHost } from '@cozemble/model-editor'
import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'

export const allModels: Writable<EventSourcedModel[]> = writable([])

export interface ModelEditContext {
  context: 'create' | 'edit'
  modelId: ModelId
}

export const modelBeingEdited: Writable<ModelEditContext | null> = writable(null)

export function addNewModel() {
  const newModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Untitled model'))
  allModels.update((models) => [...models, newModel])
  modelBeingEdited.set({ modelId: newModel.model.id, context: 'create' })
}

export const host: ModelEditorHost = {
  modelChanged(id: ModelId, event: ModelEvent) {
    console.log('modelChanged', id, event)
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
    console.log('modelAdded', model)
    allModels.update((models) => [...models, eventSourcedModelFns.newInstance(model)])
  },

  modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel {
    return mandatory(
      allModels.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id}`,
    )
  },
}
