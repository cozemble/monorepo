import { coreModelEvents } from '@cozemble/model-event-sourced'
import { expect, test } from 'vitest'
import { constraints, makeSqlActions } from '@cozemble/sql-actions'
import {
  modelIdAndNameFns,
  modelNameFns,
  propertyNameFns,
  relationshipNameFns,
} from '@cozemble/model-core'
import { modelEventToSqlActions } from '../src/modelEventToSqlActions'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'

const stubSqlActions = makeSqlActions(
  () => new Date(0),
  () => 'id',
)
modelEventToSqlActions.setSqlActions(stubSqlActions)

test('model created event maps to a new table sql action', () => {
  const event = coreModelEvents.modelCreated(modelNameFns.newInstance('Customers'))
  const actions = modelEventToSqlActions.apply([], event, null)
  expect(actions).toMatchObject([stubSqlActions.newTable('Customers')])
})

test('model renamed event maps to a rename table sql action', () => {
  const customers = modelFns.newInstance('Customers')
  const renameEvent = coreModelEvents.modelRenamed(
    customers.id,
    modelNameFns.newInstance('Clients'),
  )
  const actions = modelEventToSqlActions.apply([customers], renameEvent, customers)
  expect(actions).toMatchObject([stubSqlActions.renameModel('Customers', 'Clients')])
})

test('can rename a property', () => {
  const customerModel = modelFns.newInstance(
    'Customers',
    modelOptions.withProperty(propertyFns.newInstance('Last Name')),
  )
  const nameProperty = customerModel.properties[0]
  const event = coreModelEvents.propertyRenamed(
    customerModel.id,
    customerModel.properties[0].id,
    propertyNameFns.newInstance('Surname'),
  )
  const renamedProperty = propertyFns.rename(nameProperty, 'Surname')
  const newModel = { ...customerModel, properties: [renamedProperty] }
  const actions = modelEventToSqlActions.apply([newModel], event, customerModel)
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
  const actions = modelEventToSqlActions.apply([customerModel, addressModel], event, customerModel)
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
  const actions = modelEventToSqlActions.apply([customerModel, addressModel], event, customerModel)
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

test('can mark a property as required', () => {
  const customerModel = modelFns.newInstance('Customer', modelOptions.withProperty('First name'))
  const firstNameProperty = customerModel.properties[0]
  const event = coreModelEvents.booleanPropertyChanged(
    customerModel.id,
    firstNameProperty.id,
    'required',
    true,
  )
  const actions = modelEventToSqlActions.apply([customerModel], event, customerModel)
  expect(actions).toMatchObject([stubSqlActions.makeColumnNonNullable('Customer', 'First Name')])
})

test('can mark a property as not required', () => {
  const customerModel = modelFns.newInstance('Customer', modelOptions.withProperty('First name'))
  const firstNameProperty = customerModel.properties[0]
  const event = coreModelEvents.booleanPropertyChanged(
    customerModel.id,
    firstNameProperty.id,
    'required',
    false,
  )
  const actions = modelEventToSqlActions.apply([customerModel], event, customerModel)
  expect(actions).toMatchObject([stubSqlActions.makeColumnNullable('Customer', 'First Name')])
})

test('can mark a property as unique', () => {
  const customerModel = modelFns.newInstance('Customer', modelOptions.withProperty('Email'))
  const emailProperty = customerModel.properties[0]
  const event = coreModelEvents.booleanPropertyChanged(
    customerModel.id,
    emailProperty.id,
    'unique',
    true,
  )
  const actions = modelEventToSqlActions.apply([customerModel], event, customerModel)
  expect(actions).toMatchObject([
    stubSqlActions.addColumnConstraint(
      'Customer',
      'Email',
      constraints.unique(`customerEmailUnique`),
    ),
  ])
})

test('can mark a property as not unique', () => {
  const customerModel = modelFns.newInstance('Customer', modelOptions.withProperty('Email'))
  const emailProperty = customerModel.properties[0]
  const event = coreModelEvents.booleanPropertyChanged(
    customerModel.id,
    emailProperty.id,
    'unique',
    false,
  )
  const actions = modelEventToSqlActions.apply([customerModel], event, customerModel)
  expect(actions).toMatchObject([
    stubSqlActions.dropColumnConstraint(
      'Customer',
      'Email',
      constraints.unique(`customerEmailUnique`),
    ),
  ])
})
