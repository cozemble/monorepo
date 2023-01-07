import {
  type Model,
  type ModelEvent,
  type ModelEventDescriptor,
  modelEventDescriptors,
  type ModelName,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
  timestampEpochMillis,
} from '@cozemble/model-core'
import { emptyProperty } from './stringProperty'

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
