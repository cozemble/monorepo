import {
  Model,
  ModelEvent,
  ModelEventDescriptor,
  modelEventDescriptors,
  ModelName,
  PropertyId,
  propertyIdFns,
  PropertyName,
  timestampEpochMillis,
} from '@cozemble/model-core'
import { emptyProperty } from './stringProperty'
import { modelEventIdFns } from '@cozemble/model-core'

export interface NewStringPropertyModelEvent extends ModelEvent {
  _type: 'new.string.property.model.event'
  modelName: ModelName
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newStringPropertyModelEvent(
  modelName: ModelName,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewStringPropertyModelEvent {
  return {
    _type: 'new.string.property.model.event',
    timestamp: timestampEpochMillis(),
    id: modelEventIdFns.newInstance(),
    modelName,
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(),
  }
}

export const newStringPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.string.property.model.event',
  applyEvent: (model: Model, event: NewStringPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property ${model.properties.length + 1}`),
      id: event.propertyId,
    }
    if (model.properties.some((p) => propertyIdFns.equals(p.id, event.propertyId))) {
      newProperty = { ...newProperty, id: event.propertyId }
      return {
        ...model,
        properties: model.properties.map((p) =>
          propertyIdFns.equals(p.id, event.propertyId) ? newProperty : p,
        ),
      }
    }
    return { ...model, properties: [...model.properties, newProperty] }
  },
}

export function registerModelEvents() {
  modelEventDescriptors.register(newStringPropertyModelEventDescriptor)
}
