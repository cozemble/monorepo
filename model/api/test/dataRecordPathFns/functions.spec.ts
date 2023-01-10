import { describe, expect, test } from 'vitest'
import {
  dataRecordFns,
  dataRecordPathFns,
  modelFns,
  modelOptions,
  propertyFns,
  relationshipFns,
} from '../../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import { dottedPathFns, HasOneRelationship, Property } from '@cozemble/model-core'
import { addressModel, customerModel, invoiceModel, invoiceModels } from '../../src/invoiceModel'

registerStringProperty()

describe('Given a model with a top level property', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(propertyFns.newInstance('First name')),
  )
  const [firstName] = customer.properties
  const path = dataRecordPathFns.newInstance(firstName)

  test('setValue can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordPathFns.setValue([customer], path, record, 'John')
    expect(record.values[firstName.id.value]).toEqual('John')
  })

  test('fromDottedPath can create a path from a dotted name path string', () => {
    const path = dataRecordPathFns.fromDottedPath(
      [customer],
      customer,
      dottedPathFns.newInstance('firstName', 'name'),
    )
    expect(path).toEqual(dataRecordPathFns.newInstance(firstName))
  })
})

describe('Given a model nested property', () => {
  const address = modelFns.newInstance(
    'Address',
    modelOptions.withProperties(propertyFns.newInstance('Street')),
  )
  const [street] = address.properties
  const addressRelationship = relationshipFns.newInstance(
    'Address',
    address.id,
    'one',
  ) as HasOneRelationship
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withRelationships(addressRelationship),
  )
  const path = dataRecordPathFns.newInstance(street, addressRelationship)
  const models = [customer, address]

  test('setValue can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordPathFns.setValue(models, path, record, 'Main Street')
    const addressRecord = record.values[addressRelationship.id.value]
    expect(addressRecord).toBeDefined()
    expect(addressRecord.values[street.id.value]).toEqual('Main Street')
  })

  test('fromDottedPath can create a path from a dotted name path string', () => {
    const path = dataRecordPathFns.fromDottedPath(
      models,
      customer,
      dottedPathFns.newInstance('address.street', 'name'),
    )
    expect(path).toEqual(dataRecordPathFns.newInstance(street, addressRelationship))
  })
})

test('fromDottedPath two levels deep', () => {
  const path = dataRecordPathFns.fromDottedPath(
    invoiceModels,
    invoiceModel,
    dottedPathFns.newInstance('customer.address.line1', 'name'),
  )
  const customer = modelFns.elementByName(invoiceModel, 'Customer') as HasOneRelationship
  const address = modelFns.elementByName(customerModel, 'Address') as HasOneRelationship
  const line1 = modelFns.elementByName(addressModel, 'Line 1') as Property
  expect(path).toEqual(dataRecordPathFns.newInstance(line1, customer, address))
})
