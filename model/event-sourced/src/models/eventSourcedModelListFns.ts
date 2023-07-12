import { EventSourcedModel, EventSourcedModelList } from './EventSourcedModel.js'
import {
  Cardinality,
  Model,
  ModelEvent,
  ModelId,
  ModelReference,
  modelReferenceFns,
  ModelReferenceId,
  ModelReferenceName,
  TimestampEpochMillis,
} from '@cozemble/model-core'
import { eventSourcedModelFns } from './eventSourcedModelFns.js'
import { modelSlotEvents } from './modelSlotEvents.js'
import { timestampEpochMillis } from '@cozemble/model-core'

interface AddModelEvent {
  _type: 'add.model.event'
  model: EventSourcedModel | Model
  timestamp: TimestampEpochMillis
}

interface RemoveModelEvent {
  _type: 'remove.model.event'
  modelId: ModelId
  timestamp: TimestampEpochMillis
}

interface AddModelReferenceSlotEvent {
  _type: 'add.model.reference.slot.event'
  id: ModelReferenceId
  name: ModelReferenceName
  originModelId: ModelId
  originCardinality: Cardinality
  timestamp: TimestampEpochMillis
}

interface SetReferencedModelIdEvent {
  _type: 'set.referenced.model.id.event'
  modelReferenceId: ModelReferenceId
  originModelId: ModelId
  referencedModelId: ModelId | null
  cardinality: Cardinality
  timestamp: TimestampEpochMillis
}

interface SetOriginCardinalityEvent {
  _type: 'set.origin.cardinality.event'
  modelReferenceId: ModelReferenceId
  modelId: ModelId
  originCardinality: Cardinality
  timestamp: TimestampEpochMillis
}

interface SetReferenceCardinalityEvent {
  _type: 'set.reference.cardinality.event'
  modelReferenceId: ModelReferenceId
  modelId: ModelId
  referenceCardinality: Cardinality
  timestamp: TimestampEpochMillis
}

interface RemoveModelReferenceSlotEvent {
  _type: 'remove.model.reference.slot.event'
  id: ModelReferenceId
  timestamp: TimestampEpochMillis
}

export type EventSourcedModelListEvent =
  | AddModelEvent
  | RemoveModelEvent
  | AddModelReferenceSlotEvent
  | SetReferencedModelIdEvent
  | RemoveModelReferenceSlotEvent
  | SetOriginCardinalityEvent
  | SetReferenceCardinalityEvent

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
    models: list.models.map((m: any) => {
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
      slots: m.model.slots.filter((s: any) => s.id.value !== id.value),
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

function setOriginCardinality(
  list: EventSourcedModelList,
  event: SetOriginCardinalityEvent,
): EventSourcedModelList {
  return {
    ...list,
    models: list.models.map((m) => {
      return {
        ...m,
        model: {
          ...m.model,
          slots: m.model.slots.map((s) => {
            if (s.id.value === event.modelReferenceId.value) {
              return {
                ...s,
                originCardinality: event.originCardinality,
              } as ModelReference
            }
            return s
          }),
        },
      }
    }),
  }
}

function setReferenceCardinality(
  list: EventSourcedModelList,
  event: SetReferenceCardinalityEvent,
): EventSourcedModelList {
  return {
    ...list,
    models: list.models.map((m) => {
      return {
        ...m,
        model: {
          ...m.model,
          slots: m.model.slots.map((s) => {
            if (s.id.value === event.modelReferenceId.value) {
              return {
                ...s,
                referencedCardinality: event.referenceCardinality,
              } as ModelReference
            }
            return s
          }),
        },
      }
    }),
  }
}

function applyEventSourcedModelListEvent(
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
    case 'set.origin.cardinality.event':
      return setOriginCardinality(list, event)
    case 'set.reference.cardinality.event':
      return setReferenceCardinality(list, event)
  }
}

function eventSourceModelListReducer(
  list: EventSourcedModelList,
  event: EventSourcedModelListEvent,
): EventSourcedModelList {
  const mutated = applyEventSourcedModelListEvent(list, event)
  return { ...mutated, events: [...mutated.events, event] }
}

export const eventSourcedModelListEvents = {
  addModel: (
    model: EventSourcedModel | Model,
    timestamp = timestampEpochMillis(),
  ): AddModelEvent => {
    return {
      _type: 'add.model.event',
      model,
      timestamp,
    }
  },
  removeModel: (modelId: ModelId, timestamp = timestampEpochMillis()): RemoveModelEvent => {
    return {
      _type: 'remove.model.event',
      modelId,
      timestamp,
    }
  },
  addModelReferenceSlot: (
    id: ModelReferenceId,
    name: ModelReferenceName,
    originModelId: ModelId,
    originCardinality: Cardinality,
    timestamp = timestampEpochMillis(),
  ): AddModelReferenceSlotEvent => {
    return {
      _type: 'add.model.reference.slot.event',
      id,
      name,
      originModelId,
      originCardinality,
      timestamp,
    }
  },
  setReferencedModelId: (
    modelReferenceId: ModelReferenceId,
    originModelId: ModelId,
    referencedModelId: ModelId | null,
    cardinality: Cardinality,
    timestamp = timestampEpochMillis(),
  ): SetReferencedModelIdEvent => {
    return {
      _type: 'set.referenced.model.id.event',
      modelReferenceId,
      originModelId,
      referencedModelId,
      cardinality,
      timestamp,
    }
  },
  removeModelReferenceSlot: (
    id: ModelReferenceId,
    timestamp = timestampEpochMillis(),
  ): RemoveModelReferenceSlotEvent => {
    return {
      _type: 'remove.model.reference.slot.event',
      id,
      timestamp,
    }
  },
  setOriginCardinality: (
    modelReferenceId: ModelReferenceId,
    modelId: ModelId,
    originCardinality: Cardinality,
    timestamp = timestampEpochMillis(),
  ): SetOriginCardinalityEvent => {
    return {
      _type: 'set.origin.cardinality.event',
      modelReferenceId,
      modelId,
      originCardinality,
      timestamp,
    }
  },
  setReferenceCardinality: (
    modelReferenceId: ModelReferenceId,
    modelId: ModelId,
    referenceCardinality: Cardinality,
    timestamp = timestampEpochMillis(),
  ): SetReferenceCardinalityEvent => {
    return {
      _type: 'set.reference.cardinality.event',
      modelReferenceId,
      modelId,
      referenceCardinality,
      timestamp,
    }
  },
}

export const eventSourcedModelListFns = {
  newInstance: (models: EventSourcedModel[] = []): EventSourcedModelList => {
    return {
      _type: 'event.sourced.model.list',
      models,
      events: [],
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
