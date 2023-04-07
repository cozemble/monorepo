import { StringProperty, stringPropertyType } from './stringProperty'
import type { ModelId, PropertyDescriptor, PropertyId, PropertyName } from '@cozemble/model-core'
import { newStringPropertyModelEvent } from './events'
import { SystemConfiguration } from '@cozemble/model-core'

/**
 * This is the PropertyDescriptor for the StringProperty.  It binds the StringProperty that we defined in stringProperty.ts
 * as the property type for this descriptor.
 *
 * It also defines the name of the property, which is used in the UI.  We are not using any dots in this name, so it will appear
 * at the top level of the property type menu.
 *
 * This string property type is going to permit users to specify whether the property is required and/or unique.  Checkboxes will
 * appear in the UI to allow the user to specify these values, as long as these booleans are true.
 *
 * The validateProperty function is used to validate the property itself, as it is being configured in a model.
 * Return errors as a Map of strings, using a dotted path name for the key to associate the error with the field in the property that is in error
 *
 * The randomValue function is used to generate a random value for this property.  This is used when generating random data for a model.  In this case we
 * use a simple random string generator.
 *
 * The validateValue function is used to validate a value that is to be stored against this property.  A string property, as we have defined it,
 * can have regex validations.  So if they are configured by the user, we need to validate that value supplied matches the regex. If it doesn't
 * we return an array of error messages.
 *
 * The setValue function is used to set a value against a property in a record.  This is used when storing data in the database.
 *
 * The getValue function is used to get a value from a record.  This is used when retrieving data from the database.
 *
 * The newProperty function is used to create a new property of this type.  Because property edits in cozemble
 * are done using event sourcing, this function must return an event that encapsulates the creation of the property.
 * How is that made and registered I hear you ask?  Please refer back to the README.md file in the root of this package.
 */
export const stringPropertyDescriptor: PropertyDescriptor<StringProperty, string> = {
  _type: 'property.descriptor',
  propertyType: stringPropertyType,
  name: { _type: 'dotted.name', value: 'String' },
  isRequireable: true,
  isUniqueable: true,
  validateProperty,
  randomValue: (): string => {
    return (Math.random() + 1).toString(36).substring(2)
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: StringProperty,
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
  setValue: (systemConfiguration: SystemConfiguration, property, record, value) => {
    return {
      ...record,
      values: {
        ...record.values,
        [property.id.value]: value,
      },
    }
  },
  getValue: (systemConfiguration: SystemConfiguration, property, record) => {
    return record.values[property.id.value] ?? null
  },
  newProperty: (
    systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => newStringPropertyModelEvent(modelId, propertyName, propertyId),
}

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
