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

export const removeEmptyValues = (obj: Record<string, any>) => {
  Object.entries(obj).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      removeEmptyValues(value)
    } else if (value === '' || value === null || value.length === 0) {
      delete obj[key]
    } else if (Array.isArray(value) && value.length > 0) {
      value.forEach((v) => removeEmptyValues(v))
    }
  })
  return obj
}
