import { JSONSchema7 } from 'json-schema'

const hasArrayType = function (schema: JSONSchema7): boolean {
  return schema.type === 'array'
}

export { hasArrayType }
