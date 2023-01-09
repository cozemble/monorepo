import { describe, expect, test } from 'vitest'
import {
  dataRecordFns,
  dataRecordPathFns,
  modelFns,
  modelOptions,
  propertyFns,
  relationshipFns,
} from '../../src'
import { dataRecordRecordPathAndValue, modelPathFns } from '../../src/modelPathFns'
import { registerStringProperty } from '@cozemble/model-string-core'
import { HasOneRelationship } from '@cozemble/model-core'

registerStringProperty()

describe('Given a model path to a top level property', () => {
  const model = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('First name')),
  )
  const [firstName] = model.properties
  const path = modelPathFns.newInstance(firstName)

  test('getValues returns the null when there is no value for the path', () => {
    const emptyRecord = dataRecordFns.newInstance(model, 'user1')
    expect(modelPathFns.getValues([model], path, emptyRecord)).toEqual(
      dataRecordRecordPathAndValue(dataRecordPathFns.newInstance(path.lastElement), null),
    )
  })

  test('getValues returns the value for the property', () => {
    const emptyRecord = dataRecordFns.random([model], model, { 'First name': 'John' })
    expect(modelPathFns.getValues([model], path, emptyRecord)).toEqual(
      dataRecordRecordPathAndValue(dataRecordPathFns.newInstance(path.lastElement), 'John'),
    )
  })
})

describe('Given a model path to a nested property', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperty(propertyFns.newInstance('Street')),
  )
  const [street] = addressModel.properties
  const address = relationshipFns.newInstance(
    'Address',
    addressModel.id,
    'one',
  ) as HasOneRelationship
  const customerModel = modelFns.newInstance('Customer', modelOptions.withRelationships(address))
  const path = modelPathFns.newInstance(street, address)

  test('getValues returns the null when there is no value for the path', () => {
    const emptyRecord = dataRecordFns.newInstance(customerModel, 'user1')
    expect(modelPathFns.getValues([customerModel, addressModel], path, emptyRecord)).toEqual(
      dataRecordRecordPathAndValue(dataRecordPathFns.newInstance(street, address), null),
    )
  })

  test('getValues returns the value for the property', () => {
    const record = dataRecordFns.random([customerModel, addressModel], customerModel, {
      Address: { Street: 'Main Street' },
    })
    expect(modelPathFns.getValues([customerModel, addressModel], path, record)).toEqual(
      dataRecordRecordPathAndValue(dataRecordPathFns.newInstance(street, address), 'Main Street'),
    )
  })
})
