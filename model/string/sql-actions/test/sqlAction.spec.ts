import { expect, test } from 'vitest'
import { newStringPropertyModelEvent } from '@cozemble/model-string-core'
import { makeSqlActions } from '@cozemble/sql-actions'
import { modelEventToSqlActions } from '@cozemble/model-sql-actions'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { registerStringPropertyEventToSqlActions } from '../src'

registerStringPropertyEventToSqlActions()
const stubSqlActions = makeSqlActions(
  () => new Date(0),
  () => 'id',
)
modelEventToSqlActions.setSqlActions(stubSqlActions)

test('generates the correct sql actions for adding a new string property', () => {
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('Untitled Property')),
  )
  const property = customerModel.properties[0]
  const event = newStringPropertyModelEvent(customerModel.id, property.name, property.id)
  const actions = modelEventToSqlActions.apply([customerModel], event, customerModel)
  expect(actions).toMatchObject([stubSqlActions.addColumn('Customer', property.name.value)])
})
