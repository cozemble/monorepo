import {Model, TimestampEpochMillis} from "./core";
import {uuids} from "@cozemble/lang-util";

export interface ModelEventId {
    _type: "model.event.id"
    value: string
}

export const modelEventIdFns = {
    newInstance: (value: string = uuids.v4()): ModelEventId => {
        return {
            _type: "model.event.id",
            value
        }
    }
}

export interface ModelEvent {
    _type: string
    id: ModelEventId
    timestamp: TimestampEpochMillis
}

export interface ModelEventDescriptor<E = any> {
    _type: "model.event.descriptor"
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
    }
}
