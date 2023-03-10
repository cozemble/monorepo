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
import {
  emptyProperty,
  ReferenceProperty,
  referencePropertyFns,
  referencePropertyOptions,
} from './referenceProperty'

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

export interface ReferencedModelChangedModelEvent extends ModelEvent {
  _type: 'referenced.model.changed.model.event'
  propertyId: PropertyId
  referencedModelId: ModelId | null
}

export function referencedModelChangedModelEvent(
  modelId: ModelId,
  propertyId: PropertyId,
  referencedModelId: ModelId | null,
) {
  return {
    _type: 'referenced.model.changed.model.event',
    ...modelEventFns.coreParts(modelId),

    propertyId,
    referencedModelId,
  }
}

export const referencedModelChangedModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'referenced.model.changed.model.event',
  applyEvent: (model: Model, event: ReferencedModelChangedModelEvent): Model => {
    return {
      ...model,
      properties: model.properties.map((p) => {
        if (propertyIdFns.equals(p.id, event.propertyId)) {
          if (p.propertyType.type !== 'reference.property') {
            throw new Error(`Property ${p.id.value} is not a reference property`)
          }
          return referencePropertyFns.applyOptions(
            p as ReferenceProperty,
            referencePropertyOptions.referencing(event.referencedModelId),
          )
        }
        return p
      }),
    }
  },
}

export function registerModelEvents() {
  modelEventDescriptors.register(newReferencePropertyModelEventDescriptor)
  modelEventDescriptors.register(referencedModelChangedModelEventDescriptor)
}
