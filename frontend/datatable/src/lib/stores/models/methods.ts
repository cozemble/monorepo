// * Refactored form lib/records/makeRecordControls.ts

import type { Writable } from 'svelte/store'

import type { NestedModelId, Cardinality, Model, ModelEvent, ModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'

import { nestedModelIdFns, modelIdAndNameFns, nestedModelNameFns } from '@cozemble/model-core'
import { coreModelEvents, eventSourcedModelFns } from '@cozemble/model-event-sourced'

//

export const modelEdited = async (
  eventSourcedModels: Writable<EventSourcedModel[]>,
  model: EventSourcedModel,
): Promise<JustErrorMessage | null> => {
  eventSourcedModels.update((models) =>
    models.map((m) => (m.model.id.value === model.model.id.value ? model : m)),
  )

  return null
}

export const updateModel = async (
  eventSourcedModels: Writable<EventSourcedModel[]>,
  modelId: ModelId,
  event: ModelEvent,
): Promise<void> => {
  eventSourcedModels.update((models) => {
    const model = eventSourcedModelFns.findById(models, modelId)

    const mutated = eventSourcedModelFns.addEvent(model, event)

    return models.map((model) => (model.model.id.value === modelId.value ? mutated : model))
  })
}

export const addNestedModel = async (
  eventSourcedModels: Writable<EventSourcedModel[]>,
  parentModel: EventSourcedModel,
  childModel: Model,
  cardinality: Cardinality,
): Promise<NestedModelId> => {
  childModel.parentModelId = parentModel.model.id

  eventSourcedModels.update((models) => {
    const newEventSourcedModel = eventSourcedModelFns.newInstance(childModel)
    return [...models, newEventSourcedModel]
  })

  const parent = modelIdAndNameFns.fromModel(parentModel.model)
  const child = modelIdAndNameFns.fromModel(childModel)

  const name =
    cardinality === 'one'
      ? nestedModelNameFns.newInstance(childModel.name.value)
      : nestedModelNameFns.newInstance(childModel.pluralName.value)
  const nestedModelId = nestedModelIdFns.newInstance()
  const event = coreModelEvents.nestedModelAdded(parent, child, cardinality, name, nestedModelId)

  await updateModel(eventSourcedModels, parentModel.model.id, event)

  return nestedModelId
}
