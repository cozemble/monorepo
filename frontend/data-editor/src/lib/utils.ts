import _ from 'lodash'

/** Initialize an object with empty values based on the schema */
export const initValues = (schema: CozJSONSchema): AnyValue => {
  if (schema.type === 'array') return schema.default || []

  if (schema.type === 'object') {
    return Object.entries(schema.properties || {}).reduce((prev, [key, value]) => {
      prev[key] = initValues(value)

      return prev
    }, {} as ObjectValue)
  }

  if (schema.type === 'string') return schema.default || ''

  if (schema.type === 'number' || schema.type === 'integer') return schema.default || 0

  if (schema.type === 'boolean') return schema.default || false

  return schema.default || null
}

/** Remove empty values from an object */
export const removeEmptyValues = (value: AnyValue): AnyValue => {
  // array
  if (_.isArray(value) && value.length > 0) return value.map((v) => removeEmptyValues(v))

  // object
  if (_.isObject(value))
    return Object.entries(value).reduce((prev, [key, value]) => {
      prev[key] = removeEmptyValues(value)

      return prev
    }, {} as ObjectValue)

  // simple value
  const emptyValues = ['', null, undefined, NaN]
  if (!_.includes(emptyValues, value)) return value
}

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
    return !_.isEqual(base, object) ? object : null
  }

  return object
}
