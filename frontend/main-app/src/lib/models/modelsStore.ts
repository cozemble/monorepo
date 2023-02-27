import { modelFns, modelIdFns } from '@cozemble/model-api'
import { type EventSourcedModel, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import type { ModelEditorHost } from '@cozemble/model-editor'
import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'
import type { BackendModel, BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { config } from '../config'
import { backendTenant } from '../tenants/tenantStore'

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
    return mandatory(
      allModels.find((m) => modelIdFns.equals(m.model.id, id)),
      `No model with id ${id}`,
    )
  },
}

function toBackendModel(m: EventSourcedModel): BackendModel {
  return {
    id: m.model.id.value,
    name: m.model.name.value,
    definition: m.model,
    events: m.events.map((e) => ({ id: e.id.value, definition: e })),
  }
}

export async function putAllModels(tenant: BackendTenant, all: EventSourcedModel[]) {
  const models = all.map((m) => toBackendModel(m))
  const newBackendTenant: BackendTenant = {
    id: tenant.id,
    name: tenant.name,
    models,
  }
  const result = await fetch(`${config.backendUrl()}/api/v1/tenant/${tenant.id}/model`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newBackendTenant),
  })
  if (!result.ok) {
    throw new Error(`Failed to save models: ${result.statusText}`)
  }
  backendTenant.set(newBackendTenant)
}

export function loadModels(models: BackendModel[]) {
  allModels.set(models.map((m) => eventSourcedModelFns.newInstance(m.definition)))
}
