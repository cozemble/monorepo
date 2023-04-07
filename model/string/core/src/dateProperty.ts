import {
  DataRecord,
  Model,
  ModelEvent,
  ModelEventDescriptor,
  modelEventFns,
  ModelId,
  type Property,
  PropertyDescriptor,
  PropertyId,
  propertyIdFns,
  PropertyName,
  propertyNameFns,
  propertyTypeFns,
  SlotConfiguration,
  SlotSystemConfigurationDescriptor,
  SystemConfiguration,
} from '@cozemble/model-core'
import { modelEventDescriptors } from '@cozemble/model-core'

export const datePropertyType = propertyTypeFns.newInstance('date.property')

export interface DateProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'date.property' }
}

export function emptyProperty(name: string): DateProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', value: 'date.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
  }
}

export interface DatePropertyConfiguration {
  dateFormat: string
  timezone: string
}

export interface DatePropertySystemConfiguration
  extends SlotConfiguration<DatePropertyConfiguration> {
  _type: 'slot.configuration'
  slotType: 'date.property'
  configuration: DatePropertyConfiguration
}

export const datePropertySystemConfigurationDescriptor: SlotSystemConfigurationDescriptor = {
  _type: 'slot.system.configuration.descriptor',
  slotType: 'date.property',
  defaultValues: async () => {
    return {
      dateFormat: 'yyyy-MM-dd',
      timezone: 'UTC',
    }
  },
  editorComponent: async () => {
    return {}
    // return import('./DatePropertySystemConfigurationEditor.svelte')
  },
  validateValue: async (_value) => {
    return new Map()
  },
}

function formatDate(systemConfiguration: SystemConfiguration, date: Date): string {
  const config: DatePropertyConfiguration =
    systemConfiguration.slotConfiguration['date.property']?.configuration ??
    datePropertySystemConfigurationDescriptor.defaultValues()
  const yyyy = String(date.getFullYear())
  const mm = String(date.getMonth() + 1).padStart(2, '0') // Months are 0-based, so we need to add 1 and pad with 0 if needed
  const dd = String(date.getDate()).padStart(2, '0') // Pad the day with 0 if needed

  return config.dateFormat.replace('yyyy', yyyy).replace('MM', mm).replace('dd', dd)
}

export const datePropertyDescriptor: PropertyDescriptor<DateProperty, string> = {
  _type: 'property.descriptor',
  propertyType: datePropertyType,
  name: { _type: 'dotted.name', value: 'Date' },
  isRequireable: true,
  isUniqueable: false,
  validateProperty: function (_property: DateProperty): Map<string, string> {
    return new Map<string, string>()
  },
  randomValue: (systemConfiguration: SystemConfiguration): string => {
    return formatDate(systemConfiguration, new Date())
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: DateProperty,
    value: string | null,
  ): string[] => {
    if (
      (property.required && value === null) ||
      value === undefined ||
      value?.trim().length === 0
    ) {
      return ['Required']
    }
    return []
  },
  setValue: (
    systemConfiguration: SystemConfiguration,
    property: Property,
    record: DataRecord,
    value: string | null,
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
  ) => newDatePropertyModelEvent(modelId, propertyName, propertyId),
}

export interface NewDatePropertyModelEvent extends ModelEvent {
  _type: 'new.date.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newDatePropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewDatePropertyModelEvent {
  return {
    _type: 'new.date.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

export const newDatePropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.date.property.model.event',
  applyEvent: (model: Model, event: NewDatePropertyModelEvent): Model => {
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
  modelEventDescriptors.register(newDatePropertyModelEventDescriptor)
}
