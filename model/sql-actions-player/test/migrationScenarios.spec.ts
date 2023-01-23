import { expect, test } from 'vitest'
import { coreModelEvents, eventSourcedModelFns } from '@cozemble/model-event-sourced'
import { modelNameFns, propertyIdFns, propertyNameFns } from '@cozemble/model-core'
import { newStringPropertyModelEvent, registerStringProperty } from '@cozemble/model-string-core'
import { makeSqlActions } from '@cozemble/sql-actions'
import { modelEventToSqlActions } from '@cozemble/model-sql-actions'
import { registerStringPropertyEventToSqlActions } from '@cozemble/model-string-sql-actions'
import { sqlActionsPlayer } from '../src'

const stubSqlActions = makeSqlActions(
  () => new Date(0),
  () => 'id',
)

modelEventToSqlActions.setSqlActions(stubSqlActions)

registerStringProperty()
registerStringPropertyEventToSqlActions()

test('Can create a model, add a property, rename the property, make it required and rename the model', () => {
  let model = eventSourcedModelFns.newInstance(modelNameFns.newInstance('my model'))
  const addPropertyEvent = newStringPropertyModelEvent(
    model.model.id,
    propertyNameFns.newInstance('my property'),
    propertyIdFns.newInstance(),
  )
  const propertyRenameEvent = coreModelEvents.propertyRenamed(
    model.model.id,
    addPropertyEvent.propertyId,
    propertyNameFns.newInstance('First name'),
  )
  const makeRequiredEvent = coreModelEvents.booleanPropertyChanged(
    model.model.id,
    addPropertyEvent.propertyId,
    'required',
    true,
  )
  const modelRenameEvent = coreModelEvents.modelRenamed(
    model.model.id,
    modelNameFns.newInstance('Customer'),
  )
  model = eventSourcedModelFns.addEvent(model, addPropertyEvent)
  model = eventSourcedModelFns.addEvent(model, propertyRenameEvent)
  model = eventSourcedModelFns.addEvent(model, makeRequiredEvent)
  model = eventSourcedModelFns.addEvent(model, modelRenameEvent)

  const sqlActions = sqlActionsPlayer.play([model])
  expect(sqlActions).toEqual([
    stubSqlActions.newTable('my model'),
    stubSqlActions.addColumn('my model', 'is_deleted', 'boolean'),
    stubSqlActions.addColumn('my model', 'created_by'),
    stubSqlActions.addColumn('my model', 'created_at', 'timestamp'),
    stubSqlActions.addColumn('my model', 'updated_at', 'timestamp'),
    stubSqlActions.addColumn('my model', 'my property'),
    stubSqlActions.renameColumn('my model', 'my property', 'First name'),
    stubSqlActions.makeColumnNonNullable('my model', 'First name'),
    stubSqlActions.renameModel('my model', 'Customer'),
  ])
})
