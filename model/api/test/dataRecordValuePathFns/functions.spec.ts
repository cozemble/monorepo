import { describe, expect, test } from 'vitest'
import {
  dataRecordFns,
  dataRecordValuePathFns,
  modelFns,
  modelOptions,
  nestedModelFns,
  propertyFns,
} from '../../src/index.js'
import {
  dottedPathFns,
  type NestedModel,
  type Property,
  systemConfigurationFns,
} from '@cozemble/model-core'
import { addressModel, customerModel, invoiceModel, invoiceModels } from '../../src/invoiceModel.js'
import { registerJsonStringProperty } from '@cozemble/model-properties-core'

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given a model with a top level property', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(propertyFns.newInstance('First name')),
  )
  const [firstName] = modelFns.properties(customer)
  const path = dataRecordValuePathFns.newInstance(firstName)

  test('setValue can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordValuePathFns.setValue(systemConfig, [customer], path, record, 'John')
    expect(record.values[firstName.id.value]).toEqual('John')
  })

  test('fromDottedPath can create a path from a dotted name path string', () => {
    const path = dataRecordValuePathFns.fromDottedPath(
      [customer],
      customer,
      dottedPathFns.newInstance('firstName', 'name'),
    )
    expect(path).toEqual(dataRecordValuePathFns.newInstance(firstName))
  })
})

describe('Given a model nested property', () => {
  const address = modelFns.newInstance(
    'Address',
    modelOptions.withProperties(propertyFns.newInstance('Street')),
  )
  const [street] = modelFns.properties(address)
  const addressRelationship = nestedModelFns.newInstance(
    'Address',
    address.id,
    'one',
  ) as NestedModel
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withNestedModels(addressRelationship),
  )
  const path = dataRecordValuePathFns.newInstance(street, addressRelationship)
  const models = [customer, address]

  test('setValue can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordValuePathFns.setValue(systemConfig, models, path, record, 'Main Street')
    const addressRecord = record.values[addressRelationship.id.value]
    expect(addressRecord).toBeDefined()
    expect(addressRecord.values[street.id.value]).toEqual('Main Street')
  })

  test('fromDottedPath can create a path from a dotted name path string', () => {
    const path = dataRecordValuePathFns.fromDottedPath(
      models,
      customer,
      dottedPathFns.newInstance('address.street', 'name'),
    )
    expect(path).toEqual(dataRecordValuePathFns.newInstance(street, addressRelationship))
  })
})

test('fromDottedPath two levels deep', () => {
  const path = dataRecordValuePathFns.fromDottedPath(
    invoiceModels,
    invoiceModel,
    dottedPathFns.newInstance('customer.address.line1', 'name'),
  )
  const customer = modelFns.elementByName(invoiceModel, 'Customer') as NestedModel
  const address = modelFns.elementByName(customerModel, 'Address') as NestedModel
  const line1 = modelFns.elementByName(addressModel, 'Line 1') as Property
  expect(path).toEqual(dataRecordValuePathFns.newInstance(line1, customer, address))
})

test('elementByName errors is name is ambiguous', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperties(propertyFns.newInstance('Name'), propertyFns.newInstance('Name')),
  )
  try {
    modelFns.elementByName(model, 'Name')
    expect(true).toEqual(false)
  } catch (e) {
    expect(e.message).toMatch('Multiple model elements found with name')
  }
})
