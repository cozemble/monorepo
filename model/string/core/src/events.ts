import {
  type Model,
  type ModelEvent,
  type ModelEventDescriptor,
  modelEventDescriptors,
  modelEventFns,
  type ModelId,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
} from '@cozemble/model-core'
import { emptyProperty } from './stringProperty'

export interface NewStringPropertyModelEvent extends ModelEvent {
  _type: 'new.string.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newStringPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewStringPropertyModelEvent {
  return {
    _type: 'new.string.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(),
  }
}

export const newStringPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.string.property.model.event',
  applyEvent: (model: Model, event: NewStringPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
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
