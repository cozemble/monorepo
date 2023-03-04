import { GraphQLObjectType, GraphQLType } from 'graphql'
import { JSONSchema7 } from 'json-schema'

declare namespace json2gql {
  export interface GraphQLTypeMap {
    [name: string]: GraphQLType
  }

  export type EntryPointBuilder = (types: GraphQLTypeMap) => {
    query: GraphQLObjectType
    mutation?: GraphQLObjectType
    subscription?: GraphQLObjectType
  }

  export type JSONArraySchema = JSONSchema7 | JSONSchema7[] | string | string[]
  export type JSONSchema = JSONSchema7 | string

  export interface ConvertParams {
    jsonSchema: JSONSchema7 | JSONSchema7[] | string | string[]
    entryPoints?: EntryPointBuilder
  }
}

export = json2gql
