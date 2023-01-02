import {modelFns} from '@cozemble/model-api'
import {Model, timestampEpochMillis, TimestampEpochMillis} from '@cozemble/model-core'
export interface ModelEvent {
    _type: string
    timestamp: TimestampEpochMillis
}

export interface EventSourcedModel {
    _type: "event.sourced.model"
    model: Model
    events: ModelEvent[]
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

export const eventSourcedModelFns = {
    newInstance: (name: string): EventSourcedModel => {
        return {
            _type: "event.sourced.model",
            model: modelFns.newInstance(name),
            events: [modelCreated(name)]
        }
    },
    addEvent: (eventSourcedModel: EventSourcedModel, event: ModelEvent): EventSourcedModel => {
        return {
            ...eventSourcedModel,
            model: modelEventDescriptors.applyEvent(eventSourcedModel.model, event),
            events: [...eventSourcedModel.events, event]
        }
    }
}

export interface ModelCreated extends ModelEvent {
    _type: "model.created.event"
    modelName: string
}

export function modelCreated(modelName: string): ModelCreated {
    return {
        _type: "model.created.event",
        timestamp: timestampEpochMillis(),
        modelName
    }
}

export interface ModelRenamed extends ModelEvent {
    _type: "model.renamed.event"
    modelName: string
}

export function modelRenamed(modelName: string): ModelRenamed {
    return {
        _type: "model.renamed.event",
        timestamp: timestampEpochMillis(),
        modelName
    }
}

const modelRenamedDescriptor: ModelEventDescriptor<ModelRenamed> = {
    _type: "model.event.descriptor",
    modelEventType: "model.renamed.event",
    applyEvent: (model, event) => {
        return {
            ...model,
            name: event.modelName
        }
    }
}

modelEventDescriptors.register(modelRenamedDescriptor)
