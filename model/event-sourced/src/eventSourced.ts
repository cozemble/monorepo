import {Model, ModelEvent, modelEventDescriptors} from "@cozemble/model-core";
import {emptyModel} from "@cozemble/model-core";
import {timestampEpochMillis} from "@cozemble/model-core";

export interface EventSourcedModel {
    _type: "event.sourced.model"
    model: Model
    events: ModelEvent[]
}

interface ModelCreated extends ModelEvent {
    _type: "model.created.event"
    modelName: string
}

function modelCreated(modelName: string): ModelCreated {
    return {
        _type: "model.created.event",
        timestamp: timestampEpochMillis(),
        modelName
    }
}

export const eventSourcedModelFns = {
    newInstance: (modelOrName: Model | string): EventSourcedModel => {
        const model = typeof modelOrName === 'string' ? emptyModel(modelOrName) : modelOrName
        return {
            _type: "event.sourced.model",
            model,
            events: [modelCreated(model.name)]
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