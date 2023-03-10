import { modelFns, modelIdFns } from '@cozemble/model-api'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { ModelEditorHost } from '@cozemble/model-editor'
import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'
import { config } from '../config'
import { cozauth } from '../auth/cozauth'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'

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
    console.log(`Looking for model with id ${id.value} in model of length ${allModels.length}`)
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
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  const models = all.map((m) => toBackendModel(m))
  const result = await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}/model`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(models),
  })
  if (!result.ok) {
    throw new Error(`Failed to save models: ${result.statusText}`)
  }
}
