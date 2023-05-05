import { modelFns, modelIdFns } from '@cozemble/model-api'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { ModelEditorHost } from '@cozemble/model-editor'
import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import { backend } from '../backend/backendStore'
import { gettableWritable } from '@cozemble/frontend-datatable'
import { derived } from 'svelte/store'

export const eventSourcedModels = gettableWritable([] as EventSourcedModel[])
export const models = derived(eventSourcedModels, (ms) => ms.map((m: EventSourcedModel) => m.model))

export interface ModelEditContext {
  context: 'create' | 'edit'
  modelId: ModelId
}

export const modelBeingEdited: Writable<ModelEditContext | null> = writable(null)

export function addNewModel() {
  const newModel = eventSourcedModelFns.newInstance(modelFns.newInstance('Untitled model'))
  eventSourcedModels.update((models) => [...models, newModel])
  modelBeingEdited.set({ modelId: newModel.model.id, context: 'create' })
}

export const host: ModelEditorHost = {
  modelChanged(id: ModelId, event: ModelEvent) {
    eventSourcedModels.update((models) => {
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
    eventSourcedModels.update((models) => [...models, eventSourcedModelFns.newInstance(model)])
  },

  modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel {
    return mandatory(
      allModels.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id.value}, options are ${allModels
        .map((m) => m.model.id.value)
        .join(', ')}`,
    )
  },
}

function toBackendModel(m: EventSourcedModel): BackendModel {
  return {
    _type: 'backend.model',
    model: m.model,
    events: m.events,
  }
}

export async function putAllModels(tenantId: string, all: EventSourcedModel[]) {
  const models = all.map((m) => toBackendModel(m))
  return backend.putModels(tenantId, models)
}
