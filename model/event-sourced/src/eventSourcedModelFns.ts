import { arrays, mandatory } from '@cozemble/lang-util'
import {
  emptyModel,
  type Model,
  type ModelEvent,
  modelEventDescriptors,
  type ModelId,
  type ModelName,
  modelEventFns,
} from '@cozemble/model-core'
import { coreModelEvents, ModelCreated } from './events'
import { EventSourcedModel } from './EventSourcedModel'

export const eventSourcedModelFns = {
  newInstance: (modelOrName: Model | ModelName): EventSourcedModel => {
    const model = modelOrName._type === 'model' ? modelOrName : emptyModel(modelOrName)
    return {
      _type: 'event.sourced.model',
      model,
      events: [coreModelEvents.modelCreated(model.name, model.id)],
    }
  },
  fromCreatedEvent: (event: ModelCreated): EventSourcedModel => {
    return {
      _type: 'event.sourced.model',
      model: { ...emptyModel(event.modelName), id: event.modelId },
      events: [event],
    }
  },
  addEvent: (eventSourcedModel: EventSourcedModel, event: ModelEvent): EventSourcedModel => {
    event = modelEventFns.withOptions(event, { insertionOrder: eventSourcedModel.events.length })
    return {
      ...eventSourcedModel,
      model: modelEventDescriptors.applyEvent(eventSourcedModel.model, event),
      events: [...eventSourcedModel.events, event],
    }
  },
  findById: (models: EventSourcedModel[], modelId: ModelId): EventSourcedModel => {
    return mandatory(
      models.find((model) => model.model.id.value === modelId.value),
      `no model found for model id: ${modelId.value}`,
    )
  },
  playAll: (
    events: ModelEvent[],
    onEachEvent: (event: ModelEvent, oldModel: Model | null, currentModels: Model[]) => void,
  ): EventSourcedModel[] => {
    events = arrays.sortBy(events, (e: ModelEvent) => e.timestamp.value + e.insertionOrder)
    return events.reduce((models, event) => {
      if (event._type === 'model.created.event') {
        const newModel = eventSourcedModelFns.fromCreatedEvent(event as ModelCreated)
        models = [...models, newModel]
        onEachEvent(
          event,
          null,
          models.map((m) => m.model),
        )
        return models
      } else {
        let model = eventSourcedModelFns.findById(models, event.modelId)
        const oldModel = model.model
        model = eventSourcedModelFns.addEvent(model, event)
        models = models.map((m) => (m.model.id.value === model.model.id.value ? model : m))
        onEachEvent(
          event,
          oldModel,
          models.map((m) => m.model),
        )
        return models
      }
    }, [] as EventSourcedModel[])
  },
}
