import { Model, ModelId, timestampEpochMillis, TimestampEpochMillis } from './core'
import { uuids } from '@cozemble/lang-util'

export interface ModelEventId {
  _type: 'model.event.id'
  value: string
}

export const modelEventIdFns = {
  newInstance: (value: string = uuids.v4()): ModelEventId => {
    return {
      _type: 'model.event.id',
      value,
    }
  },
}

export interface ModelEvent {
  _type: string
  id: ModelEventId
  modelId: ModelId
  timestamp: TimestampEpochMillis
  insertionOrder: number
}

export const modelEventFns = {
  coreParts: (modelId: ModelId): Omit<ModelEvent, '_type'> => {
    return {
      id: modelEventIdFns.newInstance(),
      modelId,
      timestamp: timestampEpochMillis(),
      insertionOrder: 0,
    }
  },
  withOptions: (event: ModelEvent, options: Partial<ModelEvent>): ModelEvent => {
    return {
      ...event,
      ...options,
    }
  },
}

export interface ModelEventDescriptor<E = any> {
  _type: 'model.event.descriptor'
  modelEventType: string
  applyEvent: (model: Model, event: E) => Model
}

const registeredModelEvents = new Map<string, ModelEventDescriptor>()

export const modelEventDescriptors = {
  register: (descriptor: ModelEventDescriptor) => {
    registeredModelEvents.set(descriptor.modelEventType, descriptor)
  },
  applyEvent: (model: Model, event: ModelEvent): Model => {
    const descriptor = registeredModelEvents.get(event._type)
    if (descriptor) {
      return descriptor.applyEvent(model, event)
    } else {
      throw new Error(`Unknown event type: ${event._type}`)
    }
  },
}
