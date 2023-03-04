import { GraphQLSchema } from 'graphql'
import { JSONSchema7 } from 'json-schema'
import { GraphQLTypeMap, ConvertParams, JSONArraySchema, JSONSchema } from './@types'
import { DEFAULT_ENTRY_POINTS } from './helpers'
import { parseSchema } from './lib'

export default function convert({
  jsonSchema,
  entryPoints = DEFAULT_ENTRY_POINTS,
}: ConvertParams): GraphQLSchema {
  // coerce input to array of schema objects
  const schemaArray: JSONSchema7[] = toArray(jsonSchema).map(toSchema)

  const types: GraphQLTypeMap = schemaArray.reduce(parseSchema, {})

  return new GraphQLSchema({
    ...types,
    ...entryPoints(types),
  })
}

function toArray(x: JSONArraySchema): any[] {
  return x instanceof Array ? x : [x]
}

function toSchema(x: JSONSchema): JSONSchema7 {
  return x instanceof Object ? x : JSON.parse(x)
}
