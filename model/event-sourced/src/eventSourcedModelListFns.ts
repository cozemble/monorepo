import { EventSourcedModel, EventSourcedModelList } from './EventSourcedModel'
import { Model, ModelId, ModelReferenceId, ModelReferenceName } from '@cozemble/model-core'
import { eventSourcedModelFns } from './eventSourcedModelFns'
import { Cardinality, ModelReference, modelReferenceFns } from '@cozemble/model-core'
import { modelSlotEvents } from './modelSlotEvents'

interface AddModelEvent {
  _type: 'add.model.event'
  model: EventSourcedModel | Model
}

interface RemoveModelEvent {
  _type: 'remove.model.event'
  modelId: ModelId
}

interface AddModelReferenceSlotEvent {
  _type: 'add.model.reference.slot.event'
  id: ModelReferenceId
  name: ModelReferenceName
  fromModelId: ModelId
  cardinality: Cardinality
}

interface SetToModelReferenceEvent {
  _type: 'set.to.model.reference.event'
  id: ModelReferenceId
  fromModelId: ModelId
  toModelId: ModelId
  cardinality: Cardinality
}

interface RemoveModelReferenceSlotEvent {
  _type: 'remove.model.reference.slot.event'
  id: ModelReferenceId
}

export type EventSourcedModelListEvent =
  | AddModelEvent
  | RemoveModelEvent
  | AddModelReferenceSlotEvent
  | SetToModelReferenceEvent
  | RemoveModelReferenceSlotEvent

function addModel(event: AddModelEvent, list: EventSourcedModelList) {
  const addition =
    event.model._type === 'event.sourced.model'
      ? event.model
      : eventSourcedModelFns.newInstance(event.model)
  return {
    ...list,
    models: [...list.models, addition],
  }
}

function removeModel(list: EventSourcedModelList, event: RemoveModelEvent) {
  return {
    ...list,
    models: list.models.filter((m) => m.model.id.value !== event.modelId.value),
  }
}

function addModelReferenceSlot(list: EventSourcedModelList, event: AddModelReferenceSlotEvent) {
  const model = eventSourcedModelFns.findById(list.models, event.fromModelId)
  const mutated = eventSourcedModelFns.addEvent(
    model,
    modelSlotEvents.newModelReference(model.model.id, event.name, event.id),
  )
  return {
    ...list,
    models: list.models.map((m) => {
      if (m.model.id.value === mutated.model.id.value) {
        return mutated
      }
      return m
    }),
  }
}

function removeModelReferenceSlotFromModel(m: EventSourcedModel, id: ModelReferenceId) {
  return {
    ...m,
    model: {
      ...m.model,
      slots: m.model.slots.filter((s) => s.id.value !== id.value),
    },
  }
}

function removeModelReferenceSlot(
  list: EventSourcedModelList,
  event: RemoveModelReferenceSlotEvent,
) {
  return {
    ...list,
    models: list.models.map((m) => removeModelReferenceSlotFromModel(m, event.id)),
  }
}

function newToModelReferenceSlot(
  fromModel: EventSourcedModel,
  event: SetToModelReferenceEvent,
): ModelReference {
  return modelReferenceFns.newInstance(
    [event.fromModelId],
    fromModel.model.name.value,
    'to',
    event.id,
  )
}

function addToModelReferenceSlot(
  m: EventSourcedModel,
  fromModel: EventSourcedModel,
  event: SetToModelReferenceEvent,
) {
  return {
    ...m,
    model: {
      ...m.model,
      slots: [...m.model.slots, newToModelReferenceSlot(fromModel, event)],
    },
  }
}

function setToModelReference(list: EventSourcedModelList, event: SetToModelReferenceEvent) {
  const fromModel = eventSourcedModelFns.findById(list.models, event.fromModelId)
  const toModel = eventSourcedModelFns.findById(list.models, event.toModelId)
  const mutatedModels = list.models.map((m) => {
    if (m.model.id.value === fromModel.model.id.value) {
      return m
    }
    if (m.model.id.value === toModel.model.id.value) {
      return addToModelReferenceSlot(m, fromModel, event)
    }
    return removeModelReferenceSlotFromModel(m, event.id)
  })
  return {
    ...list,
    models: mutatedModels,
  }
}

function eventSourceModelListReducer(
  list: EventSourcedModelList,
  event: EventSourcedModelListEvent,
): EventSourcedModelList {
  switch (event._type) {
    case 'set.to.model.reference.event':
      return setToModelReference(list, event)
    case 'remove.model.reference.slot.event':
      return removeModelReferenceSlot(list, event)
    case 'add.model.reference.slot.event':
      return addModelReferenceSlot(list, event)
    case 'add.model.event':
      return addModel(event, list)
    case 'remove.model.event':
      return removeModel(list, event)
  }
}

export const eventSourcedModelListFns = {
  newInstance: (models: EventSourcedModel[] = []) => {
    return {
      _type: 'event.sourced.model.list',
      models,
    }
  },
  addEvent: (list: EventSourcedModelList, event: EventSourcedModelListEvent) => {
    return eventSourceModelListReducer(list, event)
  },
}
