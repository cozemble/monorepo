// * Refactored form lib/records/makeModelControls.ts

import type { Writable } from 'svelte/store'

import type { Cardinality, Model, ModelEvent, ModelId, NestedModelId } from '@cozemble/model-core'
import { modelIdAndNameFns, nestedModelIdFns, nestedModelNameFns } from '@cozemble/model-core'
import type { EventSourcedModel, EventSourcedModelList } from '@cozemble/model-event-sourced'
import { coreModelEvents, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'

//

export const modelEdited = async (
  modelList: Writable<EventSourcedModelList>,
  model: EventSourcedModel,
): Promise<JustErrorMessage | null> => {
  modelList.update((list) => {
    const mutatedModels = list.models.map((m) =>
      m.model.id.value === model.model.id.value ? model : m,
    )
    return { ...list, models: mutatedModels }
  })
  return null
}

export const updateModel = async (
  modelList: Writable<EventSourcedModelList>,
  modelId: ModelId,
  event: ModelEvent,
): Promise<void> => {
  modelList.update((list) => {
    const model = eventSourcedModelFns.findById(list.models, modelId)
    const mutated = eventSourcedModelFns.addEvent(model, event)
    const mutatedModels = list.models.map((model) =>
      model.model.id.value === modelId.value ? mutated : model,
    )
    return { ...list, models: mutatedModels }
  })
}

export const addNestedModel = async (
  modelList: Writable<EventSourcedModelList>,
  parentModel: EventSourcedModel,
  childModel: Model,
  cardinality: Cardinality,
): Promise<NestedModelId> => {
  childModel.parentModelId = parentModel.model.id
  modelList.update((list) => {
    const newEventSourcedModel = eventSourcedModelFns.newInstance(childModel)
    return { ...list, models: [...list.models, newEventSourcedModel] }
  })
  const parent = modelIdAndNameFns.fromModel(parentModel.model)
  const child = modelIdAndNameFns.fromModel(childModel)
  const name =
    cardinality === 'one'
      ? nestedModelNameFns.newInstance(childModel.name.value)
      : nestedModelNameFns.newInstance(childModel.pluralName.value)
  const nestedModelId = nestedModelIdFns.newInstance()
  const event = coreModelEvents.nestedModelAdded(parent, child, cardinality, name, nestedModelId)
  await updateModel(modelList, parentModel.model.id, event)
  return nestedModelId
}
