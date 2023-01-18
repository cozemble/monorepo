import { print } from 'graphql'
import { gql as _gql } from 'graphql-tag'
import { errors } from '@cozemble/lang-util'

export const gql = {
  parse: (statement: string): string => {
    try {
      return print(_gql(statement))
    } catch (e) {
      throw errors.prependToMessage(e, `While parsing '${statement}'\n`)
    }
  },
}
