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
export const getDifference = (object: AnyValue, base?: AnyValue): AnyValue => {
  if (!base) return object

  // array
  if (_.isArray(base) && _.isArray(object)) {
    // type casted because typescript doesn't get that base is an array
    return object.map((v, i) => getDifference(v, (<ArrayValue>base)[i]))
  }

  // object
  if (_.isObject(object)) {
    return Object.entries(object).reduce((prev, [key, value]) => {
      base = base as ObjectValue

      const diff = getDifference(value, base[key])
      return diff ? { ...prev, [key]: diff } : prev
    }, {} as ObjectValue)
  }

  // simple value
  if (_.isString(object) || _.isNumber(object) || _.isBoolean(object)) {
    !_.isEqual(base, object) ? object : null
  }

  return object
}
