import type { Schema } from 'ajv'

export const initValues = (schema: Schema) =>
  Object.entries(schema).reduce((prev, [key, value]) => {
    if (value.type === 'object') {
      prev[key] = initValues(value.properties)
    } else if (value.type === 'array') {
      prev[key] = []
    } else {
      prev[key] = ''
    }
    return prev
  }, {} as any)

export const removeEmptyValues = (obj: Record<string, any>) =>
  Object.entries(obj).reduce((prev, [key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      prev[key] = removeEmptyValues(value)
    } else if (value === '' || value === null || value.length === 0) {
      // do nothing
    } else if (Array.isArray(value) && value.length > 0) {
      prev[key] = value.map((v) => removeEmptyValues(v))
    } else {
      prev[key] = value
    }
    return prev
  }, {} as any)
