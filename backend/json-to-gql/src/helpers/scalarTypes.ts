import { GraphQLString, GraphQLInt, GraphQLFloat, GraphQLBoolean, GraphQLScalarType } from 'graphql'

type ScalarType = 'boolean' | 'integer' | 'number' | 'string'

const scalarTypeEnum = ['boolean', 'integer', 'number', 'string'] as const

const scalarTypes: Record<ScalarType, GraphQLScalarType> = {
  string: GraphQLString,
  integer: GraphQLInt,
  number: GraphQLFloat,
  boolean: GraphQLBoolean,
}

export { scalarTypes, scalarTypeEnum }
