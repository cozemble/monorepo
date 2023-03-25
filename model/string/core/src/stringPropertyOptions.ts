import { StringPropertyOption } from './stringProperty'

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
