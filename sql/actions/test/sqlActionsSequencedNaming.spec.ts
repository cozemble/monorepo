import { makeSqlActions, SqlAction } from '../src'
import { expect, test } from 'vitest'

test('every SqlAction has a timestamp and description', () => {
  const action: SqlAction = makeSqlActions().newTable('Customers')
  expect(action.meta.timestamp).toBeDefined()
  expect(action.meta.description).toBeDefined()
})
