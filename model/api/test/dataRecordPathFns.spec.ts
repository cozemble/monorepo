import { describe, expect, test } from 'vitest'
import {
  dataRecordFns,
  dataRecordPathFns,
  modelFns,
  modelOptions,
  propertyFns,
  nestedModelFns,
} from '../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import type { NestedModel } from '@cozemble/model-core'

registerStringProperty()

describe('given a model with root property', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('First name')),
  )
  const property = modelFns.properties(customer)[0]

  test('getValue returns null when the record is null or undefined', () => {
    expect(dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property), null)).toBeNull()
    expect(
      dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property), undefined),
    ).toBeNull()
  })

  test('getValue returns null when the value is empty', () => {
    const record = dataRecordFns.newInstance(customer, 'test-user')
    expect(dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property), record)).toBeNull()
  })

  test('getValue returns the value when it is there', () => {
    const record = dataRecordFns.random([customer], customer, { 'First name': 'John' })
    expect(dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property), record)).toBe('John')
  })
})

describe('given a model with root property in a has-one relationship', () => {
  const address = modelFns.newInstance(
    'Address',
    modelOptions.withProperty(propertyFns.newInstance('Post code')),
  )
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withNestedModels(nestedModelFns.newInstance('Address', address.id, 'one')),
  )
  const relationship = customer.nestedModels[0]
  const property = modelFns.properties(address)[0]
  const models = [customer, address]

  test('getValue returns null when the relationship value is null', () => {
    const record = dataRecordFns.newInstance(customer, 'test-user')
    expect(
      dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property, relationship), record),
    ).toBeNull()
  })

  test('getValue returns null when the relationship is present but the child value is null', () => {
    const addressRecord = dataRecordFns.newInstance(address, 'test-user')
    const record = dataRecordFns.newInstance(customer, 'test-user')
    record.values[relationship.id.value] = addressRecord
    expect(
      dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property, relationship), record),
    ).toBeNull()
  })

  test('getValue returns the value when the entire data chain is populated', () => {
    const addressRecord = dataRecordFns.random(models, address, { 'Post code': '12345' })
    const record = dataRecordFns.newInstance(customer, 'test-user')
    record.values[relationship.id.value] = addressRecord
    expect(
      dataRecordPathFns.getValue(dataRecordPathFns.newInstance(property, relationship), record),
    ).toBe('12345')
  })
})
