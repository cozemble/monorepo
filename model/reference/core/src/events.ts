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
import { emptyProperty } from './referenceProperty'

export interface NewReferencePropertyModelEvent extends ModelEvent {
  _type: 'new.reference.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newReferencePropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewReferencePropertyModelEvent {
  return {
    _type: 'new.reference.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

export const newReferencePropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.reference.property.model.event',
  applyEvent: (model: Model, event: NewReferencePropertyModelEvent): Model => {
    console.log(`Applying event: ${JSON.stringify(event)}`)
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
    }
    console.log({ newProperty })
    if (model.properties.some((p) => propertyIdFns.equals(p.id, event.propertyId))) {
      newProperty = { ...newProperty, id: event.propertyId }
      console.log({ newProperty, model })
      const mutatedModel = {
        ...model,
        properties: model.properties.map((p) =>
          propertyIdFns.equals(p.id, event.propertyId) ? newProperty : p,
        ),
      }
      console.log({ mutatedModel })
      return mutatedModel
    }
    return { ...model, properties: [...model.properties, newProperty] }
  },
}

export function registerModelEvents() {
  modelEventDescriptors.register(newReferencePropertyModelEventDescriptor)
}
