import { JSONSchema7, JSONSchema7TypeName } from 'json-schema'
import { scalarTypes } from './scalarTypes'

const hasScalarType = function (schema: JSONSchema7): boolean {
  if (Array.isArray(schema.type)) {
    return true
  }

  return (schema.type as JSONSchema7TypeName) in scalarTypes
}

export { hasScalarType }
