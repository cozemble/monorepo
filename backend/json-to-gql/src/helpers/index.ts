import camelCase from 'camelcase'
import { GraphQLList, GraphQLObjectType, GraphQLType } from 'graphql'
import pluralize from 'pluralize'

import { EntryPointBuilder } from '../@types'

export { hasArrayType } from './hasArrayType'
export { hasObjectType } from './hasObjectType'
export { scalarTypes, scalarTypeEnum } from './scalarTypes'

/** This generates the default `Query` block of the schema. */
export const DEFAULT_ENTRY_POINTS: EntryPointBuilder = (types) => ({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: Object.entries(types).reduce(
      (prevResult: any, [typeName, type]: [string, GraphQLType]) => ({
        ...prevResult,
        [camelCase(pluralize(typeName))]: { type: new GraphQLList(type) },
      }),
      new Map(),
    ),
  }),
})

export const err = (msg: string, propName?: string | null): Error =>
  new Error(`json2gql: ${propName ? `couldn't convert property ${propName}. ` : ''}${msg}`)
