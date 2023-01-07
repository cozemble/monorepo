import { coreModelEvents } from '@cozemble/model-event-sourced'
import { expect, test } from 'vitest'
import { constraints, makeSqlActions } from '@cozemble/sql-actions'
import {
  modelIdAndNameFns,
  modelNameFns,
  propertyIdFns,
  propertyNameFns,
} from '@cozemble/model-core'
import { modelEventToSqlActions } from '../src/modelEventToSqlActions'
import { modelFns, modelIdFns } from '@cozemble/model-api'
import { relationshipNameFns } from '@cozemble/model-core'

const stubSqlActions = makeSqlActions(
  () => new Date(0),
  () => 'id',
)
modelEventToSqlActions.setSqlActions(stubSqlActions)

test('model created event maps to a new table sql action', () => {
  const event = coreModelEvents.modelCreated(modelNameFns.newInstance('Customers'))
  const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
  expect(actions).toMatchObject([stubSqlActions.newTable('Customers')])
})

test('model renamed event maps to a rename table sql action', () => {
  const event = coreModelEvents.modelRenamed(
    modelNameFns.newInstance('Customers'),
    modelNameFns.newInstance('Clients'),
  )
  const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
  expect(actions).toMatchObject([stubSqlActions.renameModel('Customers', 'Clients')])
})

test('can rename a property', () => {
  const event = coreModelEvents.propertyRenamed(
    modelNameFns.newInstance('Customers'),
    propertyIdFns.newInstance(),
    propertyNameFns.newInstance('Last Name'),
    propertyNameFns.newInstance('Surname'),
  )
  const actions = modelEventToSqlActions.apply([], modelIdFns.newInstance(), event)
  expect(actions).toMatchObject([stubSqlActions.renameColumn('Customers', 'Last Name', 'Surname')])
})

test('can add a has one relationship', () => {
  const customerModel = modelFns.newInstance('Customer')
  const addressModel = modelFns.newInstance('Address')
  const customerRef = modelIdAndNameFns.newInstance(customerModel.id, customerModel.name)
  const addressRef = modelIdAndNameFns.newInstance(addressModel.id, addressModel.name)

  const event = coreModelEvents.relationshipAdded(
    customerRef,
    addressRef,
    'one',
    relationshipNameFns.newInstance('Address'),
  )
  const actions = modelEventToSqlActions.apply(
    [customerModel, addressModel],
    customerModel.id,
    event,
  )
  expect(actions).toMatchObject([
    stubSqlActions.addColumn('Customer', 'Address ID'),
    stubSqlActions.changeColumnType('Customer', 'Address ID', 'text', 'integer'),
    stubSqlActions.addColumnConstraint(
      'Customer',
      'Address ID',
      constraints.fk('Address', 'customerAddressFk'),
    ),
  ])
})

test('can add a has many relationship', () => {
  const customerModel = modelFns.newInstance('Customer')
  const addressModel = modelFns.newInstance('Address')
  const customerRef = modelIdAndNameFns.newInstance(customerModel.id, customerModel.name)
  const addressRef = modelIdAndNameFns.newInstance(addressModel.id, addressModel.name)
  const event = coreModelEvents.relationshipAdded(
    customerRef,
    addressRef,
    'many',
    relationshipNameFns.newInstance('Address'),
  )
  const actions = modelEventToSqlActions.apply(
    [customerModel, addressModel],
    customerModel.id,
    event,
  )
  expect(actions).toMatchObject([
    stubSqlActions.addColumn('Address', 'Customer ID'),
    stubSqlActions.changeColumnType('Address', 'Customer ID', 'text', 'integer'),
    stubSqlActions.addColumnConstraint(
      'Address',
      'Customer ID',
      constraints.fk('Customer', 'customerAddressFk'),
    ),
  ])
})
