import { Property } from '@cozemble/model-core'
import { GraphQLScalarType, GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean } from 'graphql'

export type TypeDefinition = {
  type: string
  pattern?: string
  description?: string
}

type PropertyDefinition = {
  [key: string]: TypeDefinition | Schema
}

export type Schema = {
  ref: string
  type: string
  properties: PropertyDefinition
  required: string[]
  relations?: string[]
}

type Validation = {
  regex: string
  message: string
  _type: 'regex.validation'
}

export interface IProperty extends Property {
  validations: Validation[]
}

type ScalarType = 'boolean' | 'integer' | 'number' | 'string'

export const scalarTypes: Record<ScalarType, GraphQLScalarType> = {
  string: GraphQLString,
  integer: GraphQLInt,
  number: GraphQLFloat,
  boolean: GraphQLBoolean,
}
