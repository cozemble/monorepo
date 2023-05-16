import { EventSourcedModel, EventSourcedModelList } from './EventSourcedModel'
import {
  Cardinality,
  Model,
  ModelId,
  ModelReference,
  modelReferenceFns,
  ModelReferenceId,
  ModelReferenceName,
} from '@cozemble/model-core'
import { eventSourcedModelFns } from './eventSourcedModelFns'
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

function setToModelReferenceInModel(
  m: EventSourcedModel,
  modelReferenceId: ModelReferenceId,
  toModelId: ModelId,
) {
  return {
    ...m,
    model: {
      ...m.model,
      slots: m.model.slots.map((s) => {
        if (s.id.value === modelReferenceId.value) {
          return {
            ...s,
            referencedModelIds: [toModelId],
          }
        }
        return s
      }),
    },
  }
}

function setToModelReference(list: EventSourcedModelList, event: SetToModelReferenceEvent) {
  const fromModel = eventSourcedModelFns.findById(list.models, event.fromModelId)
  const toModel = eventSourcedModelFns.findById(list.models, event.toModelId)
  const mutatedModels = list.models.map((m) => {
    if (m.model.id.value === fromModel.model.id.value) {
      return setToModelReferenceInModel(m, event.id, event.toModelId)
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

export const eventSourcedModelListEvents = {
  addModel: (model: EventSourcedModel | Model): AddModelEvent => {
    return {
      _type: 'add.model.event',
      model,
    }
  },
  removeModel: (modelId: ModelId): RemoveModelEvent => {
    return {
      _type: 'remove.model.event',
      modelId,
    }
  },
  addModelReferenceSlot: (
    id: ModelReferenceId,
    name: ModelReferenceName,
    fromModelId: ModelId,
    cardinality: Cardinality,
  ): AddModelReferenceSlotEvent => {
    return {
      _type: 'add.model.reference.slot.event',
      id,
      name,
      fromModelId,
      cardinality,
    }
  },
  setToModelReference: (
    id: ModelReferenceId,
    fromModelId: ModelId,
    toModelId: ModelId,
    cardinality: Cardinality,
  ): SetToModelReferenceEvent => {
    return {
      _type: 'set.to.model.reference.event',
      id,
      fromModelId,
      toModelId,
      cardinality,
    }
  },
  removeModelReferenceSlot: (id: ModelReferenceId): RemoveModelReferenceSlotEvent => {
    return {
      _type: 'remove.model.reference.slot.event',
      id,
    }
  },
}

export const eventSourcedModelListFns = {
  newInstance: (models: EventSourcedModel[] = []): EventSourcedModelList => {
    return {
      _type: 'event.sourced.model.list',
      models,
    }
  },
  addEvent: (list: EventSourcedModelList, event: EventSourcedModelListEvent) => {
    return eventSourceModelListReducer(list, event)
  },
}
