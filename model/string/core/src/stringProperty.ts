import { type Option, options } from '@cozemble/lang-util'
import {
  type Property,
  propertyIdFns,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'

/**
 * Step 1: Define the type of the property.  Properties are registered into Cozemble using
 * this type as their key.
 */
export const stringPropertyType = propertyTypeFns.newInstance('string.property')

/**
 * Step 2: Define the property.  The `value` of the `propertyType` must match the `value` of
 * the `stringPropertyType` defined above.  After that, you can register extra configuration
 * items that are possible on this property type.  A string can have regex validations.
 * A number type might have min/max values.  A date type might have a min/max date.
 *
 * A separate step in the process of adding a new property type is to define the user interface component
 * that will configure this property type in the Cozemble UI.  This is done in a separate package, so don't
 * worry about that here.
 *
 * A property must extend the `Property` type from `@cozemble/model-core`.
 */
export interface StringProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'string.property' }
  validations: RegexValidation[]
}

/**
 * This is just a helper type to make it easier to define the validations.
 */
export interface RegexValidation {
  _type: 'regex.validation'
  regex: string
  message: string
}

/**
 * Step 3: Define the empty property.  This is a helper function that will create a new property
 * with the correct type and default values.  This is used by the `newInstance` function below and also
 * by model edit events that we are going to have to define soon.
 *
 * Model and property edits in Cozemble are done using event sourcing, so we always begin with an
 * empty property and then apply edits to it to configure it.
 *
 * The type checker should guide you here, as you have to return a `StringProperty` from this function.
 * Note that this means we have to add an empty validations array to the property.
 */
export function emptyProperty(name: string): StringProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', value: 'string.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    validations: [],
  }
}

/**
 * Step 4: Define the options that can be applied to the property.  These are the things that
 * can be configured on the property.  In this case, we have a `required` option and a `unique`
 * option.  We also have a `validation` option that takes a `RegexValidation` object.  These options are
 * defined in the ./stringPropertyOptions.ts file.
 */
export type StringPropertyOption = Option<StringProperty>

/**
 * Step 5: This is just a coding convention that has come about slowly: for every property type, provide a
 * <propertyType>Fns object that contains functions for creating new instances of that property type, and for performing
 * other operations on that property type.
 */
export const stringPropertyFns = {
  newInstance: (nameAsStr: string, ...opts: StringPropertyOption[]): StringProperty => {
    const name = propertyNameFns.newInstance(nameAsStr)
    return options.apply({ ...emptyProperty(nameAsStr), name }, ...opts)
  },
}
