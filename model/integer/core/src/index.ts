import {
  DataRecord,
  Model,
  ModelEvent,
  ModelEventDescriptor,
  modelEventDescriptors,
  modelEventFns,
  ModelId,
  type Property,
  PropertyDescriptor,
  propertyDescriptors,
  PropertyId,
  propertyIdFns,
  PropertyName,
  propertyNameFns,
  propertyTypeFns,
  SlotConfiguration,
  SystemConfiguration,
} from '@cozemble/model-core'

export const integerPropertyType = propertyTypeFns.newInstance('integer.property')

export interface IntegerProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'integer.property' }
}

export function emptyProperty(name: string): IntegerProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', value: 'integer.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
  }
}

export const integerPropertyDescriptor: PropertyDescriptor<IntegerProperty, number> = {
  _type: 'property.descriptor',
  propertyType: integerPropertyType,
  name: { _type: 'dotted.name', value: 'Integer' },
  isRequireable: true,
  isUniqueable: false,
  validateProperty: function (_property: IntegerProperty): Map<string, string> {
    return new Map<string, string>()
  },
  randomValue: (systemConfiguration: SystemConfiguration): number => {
    return 0
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: IntegerProperty,
    value: number | null,
  ): string[] => {
    if ((property.required && value === null) || value === undefined) {
      return ['Required']
    }
    return []
  },
  setValue: (
    systemConfiguration: SystemConfiguration,
    property: Property,
    record: DataRecord,
    value: number | null,
  ) => {
    return {
      ...record,
      values: {
        ...record.values,
        [property.id.value]: value,
      },
    }
  },
  getValue: (systemConfiguration: SystemConfiguration, property: Property, record: DataRecord) => {
    return record.values[property.id.value] ?? null
  },
  newProperty: (
    systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => newIntegerPropertyModelEvent(modelId, propertyName, propertyId),
}

export interface NewIntegerPropertyModelEvent extends ModelEvent {
  _type: 'new.integer.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newIntegerPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewIntegerPropertyModelEvent {
  return {
    _type: 'new.integer.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

export const newIntegerPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.integer.property.model.event',
  applyEvent: (model: Model, event: NewIntegerPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
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

export function registerModelEvents() {
  modelEventDescriptors.register(newIntegerPropertyModelEventDescriptor)
}

export function registerIntegerProperty() {
  propertyDescriptors.register(integerPropertyDescriptor)
  registerModelEvents()
}
