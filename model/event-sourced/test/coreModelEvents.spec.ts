import { modelFns } from '@cozemble/model-api'
import { expect, test } from 'vitest'
import { coreModelEvents } from '../src'
import { modelEventDescriptors, modelIdAndNameFns, relationshipNameFns } from '@cozemble/model-core'
import { modelOptions, propertyFns, propertyOptions, relationshipFns } from '@cozemble/model-api'
import { modelNameFns, propertyNameFns } from '@cozemble/model-core'

test('has event that renames a model', () => {
  const customer = modelFns.newInstance('Customer')
  const event = coreModelEvents.modelRenamed(customer.name, modelNameFns.newInstance('Person'))

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)

  expect(mutatedCustomer.name).toEqual(modelNameFns.newInstance('Person'))
})

test('has event that renames a property in a model model', () => {
  const customer = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance(propertyOptions.named('name'))),
  )
  const nameProperty = customer.properties[0]
  const event = coreModelEvents.propertyRenamed(
    customer.name,
    nameProperty.id,
    nameProperty.name,
    propertyNameFns.newInstance('fullName'),
  )

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)
  const mutatedNameProperty = mutatedCustomer.properties[0]

  expect(mutatedNameProperty.name).toEqual(propertyNameFns.newInstance('fullName'))
})

test('has event that adds a relationship to a model', () => {
  const customer = modelFns.newInstance('Customer')
  const address = modelFns.newInstance('Address')
  const customRef = modelIdAndNameFns.newInstance(customer.id, customer.name)
  const addressRef = modelIdAndNameFns.newInstance(address.id, address.name)
  const event = coreModelEvents.relationshipAdded(
    customRef,
    addressRef,
    'one',
    relationshipNameFns.newInstance('Address'),
  )

  const mutatedCustomer = modelEventDescriptors.applyEvent(customer, event)

  expect(mutatedCustomer.relationships).toEqual([
    relationshipFns.newInstance('Address', address.id, 'one'),
  ])
})
