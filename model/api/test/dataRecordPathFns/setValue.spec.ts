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
import { HasOneRelationship } from '@cozemble/model-core'

registerStringProperty()

describe('Given a model with a top level property', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(propertyFns.newInstance('First name')),
  )
  const [firstName] = customer.properties
  const path = dataRecordPathFns.newInstance(firstName)

  test('can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordPathFns.setValue([customer], path, record, 'John')
    expect(record.values[firstName.id.value]).toEqual('John')
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

  test('can set the value of that property', () => {
    let record = dataRecordFns.newInstance(customer, 'user1')
    record = dataRecordPathFns.setValue([customer, address], path, record, 'Main Street')
    const addressRecord = record.values[addressRelationship.id.value]
    expect(addressRecord).toBeDefined()
    expect(addressRecord.values[street.id.value]).toEqual('Main Street')
  })
})
