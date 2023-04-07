import { DatePropertyOption } from './dateProperty'

const required: DatePropertyOption = (property) => {
  return { ...property, required: true }
}

const unique: DatePropertyOption = (property) => {
  return { ...property, unique: true }
}

const validation: (regex: string, message: string) => DatePropertyOption = (regex, message) => {
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