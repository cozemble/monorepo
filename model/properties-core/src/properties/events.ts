import {
  type JsonDataType,
  jsonDataTypes,
  type JsonProperty,
  type Model,
  type ModelEvent,
  type ModelEventDescriptor,
  modelEventDescriptors,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
  propertyNameFns,
  type PropertyType,
} from '@cozemble/model-core'
import { stringPropertyType } from './string/JsonStringProperty'

export interface NewJsonPropertyModelEvent extends ModelEvent {
  _type: 'new.json.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
  jsonType: JsonDataType
  propertyType: PropertyType
  configuration?: any
}

export function emptyProperty(name: string): JsonProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: stringPropertyType,
    jsonType: jsonDataTypes.string,
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    configuration: {},
  }
}

export const newJsonPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.json.property.model.event',
  applyEvent: (model: Model, event: NewJsonPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
      configuration: event.configuration ?? {},
      propertyType: event.propertyType,
      jsonType: event.jsonType,
    }
    if (model.slots.some((p) => p.id.value === event.propertyId.value)) {
      newProperty = { ...newProperty, id: event.propertyId }
      return {
        ...model,
        slots: model.slots.map((p) => (p.id.value === event.propertyId.value ? newProperty : p)),
      }
    }
    return { ...model, slots: [...model.slots, newProperty] }
  },
}

export function registerJsonPropertyEvents() {
  modelEventDescriptors.register(newJsonPropertyModelEventDescriptor)
}
