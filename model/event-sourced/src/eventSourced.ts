import {emptyModel, Model, ModelEvent, modelEventDescriptors} from "@cozemble/model-core";
import {coreModelEvents} from "./events";

export interface EventSourcedModel {
    _type: "event.sourced.model"
    model: Model
    events: ModelEvent[]
}


export const eventSourcedModelFns = {
    newInstance: (modelOrName: Model | string): EventSourcedModel => {
        const model = typeof modelOrName === 'string' ? emptyModel(modelOrName) : modelOrName
        return {
            _type: "event.sourced.model",
            model,
            events: [coreModelEvents.modelCreated(model.name)]
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