import { describe, expect, test } from 'vitest'
import {
  dataRecordFns,
  dataRecordValuePathFns,
  modelFns,
  modelOptions,
  nestedModelFns,
} from '../../src'
import {
  registerStringProperty,
  stringPropertyFns,
  stringPropertyOptions,
} from '@cozemble/model-string-core'
import type { NestedModel } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'

registerStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given a model with a top level required string property', () => {
  const requiredProperty = stringPropertyFns.newInstance('name', stringPropertyOptions.required)
  const model = modelFns.newInstance('Customer', modelOptions.withProperty(requiredProperty))

  test('validation fails if string is missing', () => {
    const record = dataRecordFns.newInstance(model, 'test-user')
    const errors = modelFns.validate(systemConfig, [model], record)
    const expected = new Map([[dataRecordValuePathFns.newInstance(requiredProperty), ['Required']]])
    expect(errors).toEqual(expected)
  })

  test('validation fails if string is empty', () => {
    const record = dataRecordFns.random(systemConfig, [model], model, { name: '' })
    const errors = modelFns.validate(systemConfig, [model], record)
    expect(errors).toEqual(
      new Map([[dataRecordValuePathFns.newInstance(requiredProperty), ['Required']]]),
    )
  })

  test('validation passes if value is present', () => {
    const record = dataRecordFns.random(systemConfig, [model], model, { name: 'Jo' })
    const errors = modelFns.validate(systemConfig, [model], record)
    expect(errors).toEqual(new Map())
  })
})

describe('Given a model with a required string property in a has-one relationship', () => {
  const requiredPostcode = stringPropertyFns.newInstance('postcode', stringPropertyOptions.required)
  const addressModel = modelFns.newInstance('Address', modelOptions.withProperty(requiredPostcode))
  const addressRelationship = nestedModelFns.newInstance(
    'address',
    addressModel.id,
    'one',
  ) as NestedModel
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withNestedModels(addressRelationship),
  )

  test('validation fails record for relationship is missing', () => {
    const record = dataRecordFns.newInstance(customerModel, 'test-user')
    const errors = modelFns.validate(systemConfig, [addressModel, customerModel], record)
    const expected = new Map([
      [dataRecordValuePathFns.newInstance(requiredPostcode, addressRelationship), ['Required']],
    ])
    expect(errors).toEqual(expected)
  })
})

describe('Given a model with a required string property in a has-many relationship', () => {
  const requiredPostcode = stringPropertyFns.newInstance('postcode', stringPropertyOptions.required)
  const addressModel = modelFns.newInstance('Address', modelOptions.withProperty(requiredPostcode))
  const emptyAddress = dataRecordFns.newInstance(addressModel, 'test-user')
  const addressRelationship = nestedModelFns.newInstance(
    'address',
    addressModel.id,
    'many',
  ) as NestedModel
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withNestedModels(addressRelationship),
  )

  test('validation fails record for relationship is missing', () => {
    const record = dataRecordFns.newInstance(customerModel, 'test-user')
    record.values[addressRelationship.id.value] = [emptyAddress]
    const errors = modelFns.validate(systemConfig, [addressModel, customerModel], record)
    const expected = new Map([
      [
        dataRecordValuePathFns.newInstance(
          requiredPostcode,
          dataRecordValuePathFns.newNestedRecordArrayPathElement(addressRelationship, 0),
        ),
        ['Required'],
      ],
    ])
    expect(errors).toEqual(expected)
  })
})
