import { EventSourcedModel, EventSourcedModelList } from './EventSourcedModel'
import {
  Cardinality,
  Model,
  ModelEvent,
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
  originModelId: ModelId
  cardinality: Cardinality
}

interface SetReferencedModelIdEvent {
  _type: 'set.referenced.model.id.event'
  modelReferenceId: ModelReferenceId
  originModelId: ModelId
  referencedModelId: ModelId | null
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
  | SetReferencedModelIdEvent
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
  const originModel = eventSourcedModelFns.findById(list.models, event.originModelId)
  const mutated = eventSourcedModelFns.addEvent(
    originModel,
    modelSlotEvents.newModelReference(originModel.model.id, event.name, event.id),
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

function newInverseModelReferenceSlot(
  list: EventSourcedModelList,
  event: SetReferencedModelIdEvent,
  referencedModelId: ModelId,
): ModelReference {
  const originModel = eventSourcedModelFns.findById(list.models, event.originModelId)
  return modelReferenceFns.newInstance(
    originModel.model.id,
    [referencedModelId],
    originModel.model.name.value,
    true,
    event.modelReferenceId,
  )
}

function addInverseModelReferenceSlot(
  list: EventSourcedModelList,
  inverseModel: EventSourcedModel,
  event: SetReferencedModelIdEvent,
  referencedModelId: ModelId,
) {
  return {
    ...inverseModel,
    model: {
      ...inverseModel.model,
      slots: [
        ...inverseModel.model.slots,
        newInverseModelReferenceSlot(list, event, referencedModelId),
      ],
    },
  }
}

function setReferencedModelId(
  m: EventSourcedModel,
  modelReferenceId: ModelReferenceId,
  referencedModelId: ModelId,
) {
  return {
    ...m,
    model: {
      ...m.model,
      slots: m.model.slots.map((s) => {
        if (s.id.value === modelReferenceId.value) {
          return {
            ...s,
            referencedModelIds: [referencedModelId],
          }
        }
        return s
      }),
    },
  }
}

function setReferencedModelIdValue(
  list: EventSourcedModelList,
  event: SetReferencedModelIdEvent,
  referencedModelId: ModelId,
) {
  // const toModel = eventSourcedModelFns.findById(list.models, toModelId)
  const mutatedModels = list.models.map((m) => {
    if (m.model.id.value === event.originModelId.value) {
      return setReferencedModelId(m, event.modelReferenceId, referencedModelId)
    }
    if (m.model.id.value === referencedModelId.value) {
      return addInverseModelReferenceSlot(list, m, event, referencedModelId)
    }
    return removeModelReferenceSlotFromModel(m, event.modelReferenceId)
  })
  return {
    ...list,
    models: mutatedModels,
  }
}

function clearReferencedModelIds(
  m: EventSourcedModel,
  modelReferenceId: ModelReferenceId,
): EventSourcedModel {
  return {
    ...m,
    model: {
      ...m.model,
      slots: m.model.slots.map((slot) => {
        if (slot.id.value === modelReferenceId.value) {
          return {
            ...slot,
            referencedModelIds: [],
          }
        }
        return slot
      }),
    },
  }
}

function removeSlot(m: EventSourcedModel, modelReferenceId: ModelReferenceId): EventSourcedModel {
  return {
    ...m,
    model: {
      ...m.model,
      slots: m.model.slots.filter((s) => s.id.value !== modelReferenceId.value),
    },
  }
}

function clearModelReferenceIdValue(
  list: EventSourcedModelList,
  modelReferenceId: ModelReferenceId,
  originalModelId: ModelId,
) {
  const mutatedModels = list.models.map((m) => {
    if (m.model.id.value === originalModelId.value) {
      return clearReferencedModelIds(m, modelReferenceId)
    }
    return removeSlot(m, modelReferenceId)
  })
  return { ...list, models: mutatedModels }
}

function handleSetReferencedModelId(list: EventSourcedModelList, event: SetReferencedModelIdEvent) {
  if (event.referencedModelId) {
    return setReferencedModelIdValue(list, event, event.referencedModelId)
  } else {
    return clearModelReferenceIdValue(list, event.modelReferenceId, event.originModelId)
  }
}

function eventSourceModelListReducer(
  list: EventSourcedModelList,
  event: EventSourcedModelListEvent,
): EventSourcedModelList {
  switch (event._type) {
    case 'set.referenced.model.id.event':
      return handleSetReferencedModelId(list, event)
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
    originModelId: ModelId,
    cardinality: Cardinality,
  ): AddModelReferenceSlotEvent => {
    return {
      _type: 'add.model.reference.slot.event',
      id,
      name,
      originModelId,
      cardinality,
    }
  },
  setReferencedModelId: (
    modelReferenceId: ModelReferenceId,
    originModelId: ModelId,
    referencedModelId: ModelId | null,
    cardinality: Cardinality,
  ): SetReferencedModelIdEvent => {
    return {
      _type: 'set.referenced.model.id.event',
      modelReferenceId,
      originModelId,
      referencedModelId,
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
  addModelEvent(list: EventSourcedModelList, event: ModelEvent) {
    return {
      ...list,
      models: list.models.map((model) => {
        if (model.model.id.value === event.modelId.value) {
          return eventSourcedModelFns.addEvent(model, event)
        }
        return model
      }),
    }
  },
  modelWithId(list: EventSourcedModelList, modelId: ModelId): EventSourcedModel {
    return eventSourcedModelFns.findById(list.models, modelId)
  },
}
