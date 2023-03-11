import { emptyModel, propertyNameFns, propertyIdFns } from '@cozemble/model-core'
import { expect, test } from 'vitest'
import { newStringPropertyModelEvent } from '../src'
import { newStringPropertyModelEventDescriptor } from '../src/events'

test('adding a new string property with existing ID', () => {
  const model = emptyModel('My Model')
  const event = newStringPropertyModelEvent(
    model.id,
    propertyNameFns.newInstance('Property 1'),
    propertyIdFns.newInstance('property22'),
  )
  const newModel = newStringPropertyModelEventDescriptor.applyEvent(model, event)
  expect(newModel.properties).toHaveLength(1)
  expect(newModel.properties[0].name.value).toEqual('Property 1')
  expect(newModel.properties[0].id.value).toEqual(event.propertyId.value)
})

test('adding a new string property with new ID', () => {
  const model = emptyModel('My Model')
  const event = newStringPropertyModelEvent(model.id, propertyNameFns.newInstance('Property 1'))
  const newModel = newStringPropertyModelEventDescriptor.applyEvent(model, event)
  expect(newModel.properties).toHaveLength(1)
  expect(newModel.properties[0].name.value).toEqual('Property 1')
  expect(newModel.properties[0].id.value).toBeDefined()
})
