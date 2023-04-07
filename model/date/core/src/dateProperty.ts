import { Property, propertyIdFns, propertyNameFns, propertyTypeFns } from '@cozemble/model-core'
import { type Option, options } from '@cozemble/lang-util'

export const datePropertyType = propertyTypeFns.newInstance('date.property')

export interface DateProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'date.property' }
  validations: RegexValidation[]
}

export interface RegexValidation {
  _type: 'regex.validation'
  regex: string
  message: string
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
    validations: [],
  }
}

export type DatePropertyOption = Option<DateProperty>

export const stringPropertyFns = {
  newInstance: (nameAsStr: string, ...opts: DatePropertyOption[]): DateProperty => {
    const name = propertyNameFns.newInstance(nameAsStr)
    return options.apply({ ...emptyProperty(nameAsStr), name }, ...opts)
  },
}


// fields
// - date
// - date-sample