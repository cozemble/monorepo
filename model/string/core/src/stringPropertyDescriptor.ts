import { StringProperty, stringPropertyType } from './stringProperty'
import type { ModelId, PropertyDescriptor, PropertyId, PropertyName } from '@cozemble/model-core'
import { newStringPropertyModelEvent } from './events'

function validateProperty(property: StringProperty): Map<string, string> {
  const errors = new Map<string, string>()
  property.validations.forEach((validation, index) => {
    if (validation.regex.trim().length === 0) {
      errors.set(`validations.${index}.regex`, 'Required')
    } else {
      try {
        new RegExp(validation.regex)
      } catch (e: any) {
        errors.set(`validations.${index}.regex`, e.message)
      }
    }
    if (validation.message.trim().length === 0) {
      errors.set(`validations.${index}.message`, 'Required')
    }
  })
  return errors
}

export const stringPropertyDescriptor: PropertyDescriptor<StringProperty, string> = {
  _type: 'property.descriptor',
  propertyType: stringPropertyType,
  name: { _type: 'dotted.name', name: 'String' },
  isRequireable: true,
  isUniqueable: true,
  validateProperty,
  randomValue: (): string => {
    return (Math.random() + 1).toString(36).substring(2)
  },
  validateValue: (property: StringProperty, value: string | null): string[] => {
    if (
      (property.required && value === null) ||
      value === undefined ||
      value?.trim().length === 0
    ) {
      return ['Required']
    }
    return []
  },
  setValue: (property, record, value) => {
    return {
      ...record,
      values: {
        ...record.values,
        [property.id.value]: value,
      },
    }
  },
  getValue: (property, record) => {
    return record.values[property.id.value] ?? null
  },
  newProperty: (modelId: ModelId, propertyName: PropertyName, propertyId?: PropertyId) =>
    newStringPropertyModelEvent(modelId, propertyName, propertyId),
}
