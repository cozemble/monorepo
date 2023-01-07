import { Model, TimestampEpochMillis } from './core'

export interface ModelEvent {
  _type: string
  timestamp: TimestampEpochMillis
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
