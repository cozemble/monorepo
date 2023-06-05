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
  SystemConfiguration,
} from '@cozemble/model-core'
import { currencyModelChangedModelEventDescriptor } from './events';

export const currencyPropertyType = propertyTypeFns.newInstance('currency.property')

export interface CurrencyProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'currency.property' }
  currency: string // Currency to be used for formatting (USD|EUR|GBP)
  locale: string // Locale to be used for the currency formatting. (en-US|es-US|en-GB|de-DE)
  format?: string | null // Use the unicode currency symbol (¤) for special formatting (¤#,##0.00)
}

export function emptyProperty(name: string): CurrencyProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', value: 'currency.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    currency: 'USD',
    locale: 'en-US',
  }
}

function formatCurrency(value: number, currency = 'USD', locale = 'en-US'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

interface CurrencyPropertyDescriptor<V = any> extends PropertyDescriptor {
  getRawValue(
    systemConfiguration: SystemConfiguration,
    property: Property,
    record: DataRecord,
  ): V | null
}

export const currencyPropertyDescriptor: CurrencyPropertyDescriptor = {
  _type: 'property.descriptor',
  propertyType: currencyPropertyType,
  name: { _type: 'dotted.name', value: 'Currency' },
  isRequireable: true,
  isUniqueable: false,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validateProperty: function (_property: CurrencyProperty): Map<string, string> {
    return new Map<string, string>()
  },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  randomValue: (_systemConfiguration: SystemConfiguration): number => {
    return 0
  },
  validateValue: (
    _systemConfiguration: SystemConfiguration,
    property: CurrencyProperty,
    value: number | null,
  ): string[] => {
    if ((property.required && value === null) || value === undefined) {
      return ['Required']
    }
    return []
  },
  setValue: (
    _systemConfiguration: SystemConfiguration,
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
  getRawValue(
    _systemConfiguration: SystemConfiguration,
    property: CurrencyProperty,
    record: DataRecord,
  ) {
    const maybeValue = record.values[property.id.value] ?? null
    if (maybeValue === null) {
      return null
    }

    return maybeValue
  },
  getValue: (
    _systemConfiguration: SystemConfiguration,
    property: CurrencyProperty,
    record: DataRecord,
  ) => {
    const maybeValue = record.values[property.id.value] ?? null
    if (maybeValue === null) {
      return null
    }

    return formatCurrency(maybeValue, property.currency, property.locale)
  },
  newProperty: (
    _systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => newCurrencyPropertyModelEvent(modelId, propertyName, propertyId),
}

export interface NewCurrencyPropertyModelEvent extends ModelEvent {
  _type: 'new.currency.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newCurrencyPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewCurrencyPropertyModelEvent {
  return {
    _type: 'new.currency.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(propertyName.value),
  }
}

export const newCurrencyPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.currency.property.model.event',
  applyEvent: (model: Model, event: NewCurrencyPropertyModelEvent): Model => {
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
  modelEventDescriptors.register(newCurrencyPropertyModelEventDescriptor)
  modelEventDescriptors.register(currencyModelChangedModelEventDescriptor)
}

export function registerCurrencyProperty() {
  propertyDescriptors.register(currencyPropertyDescriptor)
  registerModelEvents()
}

export { currencyModelChangedModelEvent } from './events'
