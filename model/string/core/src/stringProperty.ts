import { type Option, options } from '@cozemble/lang-util'
import {
  type Property,
  propertyIdFns,
  propertyNameFns,
  propertyTypeFns,
} from '@cozemble/model-core'

export const stringPropertyType = propertyTypeFns.newInstance('string.property')

export interface RegexValidation {
  _type: 'regex.validation'
  regex: string
  message: string
}

export interface StringProperty extends Property {
  propertyType: { _type: 'property.type'; type: 'string.property' }
  required: boolean
  unique: boolean
  validations: RegexValidation[]
}

export function emptyProperty(name: string): StringProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: { _type: 'property.type', type: 'string.property' },
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    validations: [],
  }
}

export type StringPropertyOption = Option<StringProperty>

const required: StringPropertyOption = (property) => {
  return { ...property, required: true }
}

const unique: StringPropertyOption = (property) => {
  return { ...property, unique: true }
}

const validation: (regex: string, message: string) => StringPropertyOption = (regex, message) => {
  return (property) => {
    return {
      ...property,
      validations: [...property.validations, { regex, message, _type: 'regex.validation' }],
    }
  }
}
export const stringPropertyOptions = {
  required,
  unique,
  validation,
}

export const stringPropertyFns = {
  newInstance: (nameAsStr: string, ...opts: StringPropertyOption[]): StringProperty => {
    const name = propertyNameFns.newInstance(nameAsStr)
    return options.apply({ ...emptyProperty(nameAsStr), name }, ...opts)
  },
}
