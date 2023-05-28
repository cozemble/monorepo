import { modelFns, modelOptions, propertyFns, nestedModelFns } from '@cozemble/model-api'
import { expect, test } from 'vitest'
import { coreModelEvents } from '../../src'
import {
  modelEventDescriptors,
  modelIdAndNameFns,
  modelNameFns,
  propertyNameFns,
  nestedModelNameFns,
} from '@cozemble/model-core'
import { arrays } from '@cozemble/lang-util'

test('has event that renames a model', () => {
  const customer = modelFns.newInstance('Customer')
  const event = coreModelEvents.modelRenamed(customer.id, modelNameFns.newInstance('Person'))

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)

  expect(mutatedCustomer.name).toEqual(modelNameFns.newInstance('Person'))
})

test('has event that renames a property in a model model', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('name')),
  )
  const nameProperty = modelFns.properties(customer)[0]
  const event = coreModelEvents.slotRenamed(
    customer.id,
    nameProperty.id,
    propertyNameFns.newInstance('fullName'),
  )

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)
  const mutatedNameProperty = modelFns.properties(mutatedCustomer)[0]

  expect(mutatedNameProperty.name).toEqual(propertyNameFns.newInstance('fullName'))
})

test('has event that adds a relationship to a model', () => {
  const customer = modelFns.newInstance('Customer')
  const address = modelFns.newInstance('Address')
  const customRef = modelIdAndNameFns.newInstance(customer.id, customer.name)
  const addressRef = modelIdAndNameFns.newInstance(address.id, address.name)
  const event = coreModelEvents.nestedModelAdded(
    customRef,
    addressRef,
    'one',
    nestedModelNameFns.newInstance('Address'),
  )

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)

  expect(arrays.dropFields(mutatedCustomer.nestedModels, 'id')).toEqual(
    arrays.dropFields([nestedModelFns.newInstance('Address', address.id, 'one')], 'id'),
  )
})

test('has event that makes a property required', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('name')),
  )
  const nameProperty = modelFns.properties(customer)[0]
  const makeRequiredEvent = coreModelEvents.booleanPropertyChanged(
    customer.id,
    nameProperty.id,
    'required',
    true,
  )

  let mutatedCustomer = modelEventDescriptors.applyEvent(customer, makeRequiredEvent)
  expect(modelFns.properties(mutatedCustomer)[0].required).toEqual(true)

  const makeNonRequiredEvent = coreModelEvents.booleanPropertyChanged(
    customer.id,
    nameProperty.id,
    'required',
    false,
  )
  mutatedCustomer = modelEventDescriptors.applyEvent(customer, makeNonRequiredEvent)
  expect(modelFns.properties(mutatedCustomer)[0].required).toEqual(false)
})

test('has event that makes a property unique', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('name')),
  )
  const nameProperty = modelFns.properties(customer)[0]
  const makeUniqueEvent = coreModelEvents.booleanPropertyChanged(
    customer.id,
    nameProperty.id,
    'unique',
    true,
  )

  let mutatedCustomer = modelEventDescriptors.applyEvent(customer, makeUniqueEvent)
  expect(modelFns.properties(mutatedCustomer)[0].unique).toEqual(true)

  const makeNonUniqueEvent = coreModelEvents.booleanPropertyChanged(
    customer.id,
    nameProperty.id,
    'unique',
    false,
  )
  mutatedCustomer = modelEventDescriptors.applyEvent(customer, makeNonUniqueEvent)
  expect(modelFns.properties(mutatedCustomer)[0].unique).toEqual(false)
})
