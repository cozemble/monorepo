import type { Schema } from 'ajv'
import _ from 'lodash'

/** Initialize an object with empty values based on the schema */
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
  }, {} as Record<string, any>)

/** Remove empty values from an object */
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
  }, {} as Record<string, any>)

/** Get the new values that are different from the base object */
export const getDifference = (base: Record<string, any>, object: Record<string, any>) =>
  Object.entries(object).reduce((prev, [key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      const diff = getDifference(base[key], value)
      if (Object.keys(diff).length > 0) {
        prev[key] = diff
      }
    } else if (!_.isEqual(value, base[key])) {
      prev[key] = value
    }
    return prev
  }, {} as Record<string, any>)
