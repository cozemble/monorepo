import { JSONSchema7 } from 'json-schema'

const hasObjectType = function (schema: JSONSchema7): boolean {
  return schema.type === 'object'
}

export { hasObjectType }
