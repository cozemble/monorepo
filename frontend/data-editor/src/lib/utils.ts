import type { Schema } from 'jsonschema'

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
