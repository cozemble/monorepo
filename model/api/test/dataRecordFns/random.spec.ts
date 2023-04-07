import { describe, expect, test } from 'vitest'
import { dataRecordFns, modelFns, modelOptions, propertyFns, nestedModelFns } from '../../src'
import { propertyDescriptors } from '@cozemble/model-core'
import { registerStringProperty } from '@cozemble/model-string-core'
import { systemConfigurationFns } from '@cozemble/model-core'

registerStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given a model with two top level properties', () => {
  const model = modelFns.newInstance(
    'Customer',
    modelOptions.withProperties(
      propertyFns.newInstance('First name'),
      propertyFns.newInstance('Last name'),
    ),
  )
  const [firstName, lastname] = modelFns.properties(model)

  test('random returns a random value for that property', () => {
    const record = dataRecordFns.random(systemConfig, [model], model)
    expect(
      propertyDescriptors.mandatory(firstName).getValue(systemConfig, firstName, record),
    ).not.toBe(null)
    expect(
      propertyDescriptors.mandatory(lastname).getValue(systemConfig, firstName, record),
    ).not.toBe(null)
  })

  test('value can be specified for the property', () => {
    const record = dataRecordFns.random(systemConfig, [model], model, { 'First name': 'John' })
    expect(propertyDescriptors.mandatory(firstName).getValue(systemConfig, firstName, record)).toBe(
      'John',
    )
    expect(
      propertyDescriptors.mandatory(lastname).getValue(systemConfig, firstName, record),
    ).not.toBe(null)
  })
})

describe('Given a model with two nested properties', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperties(propertyFns.newInstance('Street'), propertyFns.newInstance('Town')),
  )
  const [street, town] = modelFns.properties(addressModel)
  const address = nestedModelFns.newInstance('Address', addressModel.id, 'one')
  const customerModel = modelFns.newInstance('Customer', modelOptions.withNestedModels(address))

  test('random returns nothing for the nested property by default', () => {
    const record = dataRecordFns.random(systemConfig, [customerModel, addressModel], customerModel)
    expect(record.values[address.id.value]).toBe(undefined)
  })

  test('Prompting with values for a nested property fills the nested record', () => {
    const record = dataRecordFns.random(
      systemConfig,
      [customerModel, addressModel],
      customerModel,
      {
        Address: { Street: 'Main Street' },
      },
    )
    const addressRecord = record.values[address.id.value]
    expect(addressRecord).toBeDefined()
    expect(
      propertyDescriptors.mandatory(street).getValue(systemConfig, street, addressRecord),
    ).toBe('Main Street')
    expect(
      propertyDescriptors.mandatory(town).getValue(systemConfig, town, addressRecord),
    ).toBeDefined()
  })

  test('Prompting with a record for a nested property uses the prompted record', () => {
    const givenAddressRecord = dataRecordFns.random(systemConfig, [addressModel], addressModel)
    const record = dataRecordFns.random(
      systemConfig,
      [customerModel, addressModel],
      customerModel,
      {
        Address: givenAddressRecord,
      },
    )
    const addressRecord = record.values[address.id.value]
    expect(addressRecord).toEqual(givenAddressRecord)
  })
})
