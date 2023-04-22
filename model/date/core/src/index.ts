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
import { format, parse } from 'date-fns'

const iso8601DateFormat = 'yyyy-MM-dd'
const defaultDateFormat = 'yyyy-MM-dd'
const html5InputDateFormat = 'yyyy-MM-dd'

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

export const datePropertyConfigurationFns = {
  defaultValue: (): DatePropertyConfiguration => {
    return {
      dateFormat: defaultDateFormat,
      timezone: 'UTC',
    }
  },
}

export interface DatePropertySystemConfiguration
  extends SlotConfiguration<DatePropertyConfiguration> {
  _type: 'slot.configuration'
  slotType: 'date.property'
  configuration: DatePropertyConfiguration
}

function formatDate(systemConfiguration: SystemConfiguration, date: Date): string {
  return format(date, systemConfigurationDateFormat(systemConfiguration))
}

function systemConfigurationDateFormat(systemConfiguration: SystemConfiguration): string {
  return (
    systemConfiguration.slotConfiguration['date.property']?.configuration?.dateFormat ??
    defaultDateFormat
  )
}

function html5InputAsIsoDate(
  systemConfiguration: SystemConfiguration,
  value: string | null,
): string | null {
  if (value === null) {
    return null
  }
  return format(parse(value, html5InputDateFormat, new Date(0)), iso8601DateFormat)
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
    const persistedValue = html5InputAsIsoDate(systemConfiguration, value)
    return {
      ...record,
      values: {
        ...record.values,
        [property.id.value]: persistedValue,
      },
    }
  },
  getValue: (systemConfiguration: SystemConfiguration, property: Property, record: DataRecord) => {
    const maybeValue = record.values[property.id.value] ?? null
    if (maybeValue === null) {
      return null
    }
    const parsed = parse(maybeValue, iso8601DateFormat, new Date(0))
    return format(parsed, systemConfigurationDateFormat(systemConfiguration))
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

export function registerDateProperty() {
  propertyDescriptors.register(datePropertyDescriptor)
  registerModelEvents()
}
