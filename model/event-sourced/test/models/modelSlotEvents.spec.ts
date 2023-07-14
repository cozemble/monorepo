import { beforeEach, describe, expect, test } from 'vitest'
import {
  Model,
  modelEventDescriptors,
  modelReferenceFns,
  modelReferenceIdFns,
  modelReferenceNameFns,
  Property,
} from '@cozemble/model-core'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'
import { modelSlotEvents } from '../../src/index.ts'

describe('given a model with a property', () => {
  let model: Model
  let property: Property

  beforeEach(() => {
    property = propertyFns.newInstance('name')
    model = modelFns.newInstance('Person', modelOptions.withProperty(property))
  })

  test('can change the type to a model.reference', () => {
    const expectedName = modelReferenceNameFns.newInstance('name')
    const expectedId = modelReferenceIdFns.newInstance(property.id.value)
    const event = modelSlotEvents.newModelReference(model.id, expectedName, expectedId)
    const mutatedModel = modelEventDescriptors.applyEvent(model, event)
    expect(mutatedModel.slots[0]).toEqual(
      modelReferenceFns.newInstance(model.id, [], expectedName, false, expectedId),
    )
  })

  test('can add a new model.reference', () => {
    const expectedName = modelReferenceNameFns.newInstance('name')
    const expectedId = modelReferenceIdFns.newInstance()
    const event = modelSlotEvents.newModelReference(model.id, expectedName, expectedId)
    const mutatedModel = modelEventDescriptors.applyEvent(model, event)
    expect(mutatedModel.slots[0]).toEqual(property)
    expect(mutatedModel.slots[1]).toEqual(
      modelReferenceFns.newInstance(model.id, [], expectedName, false, expectedId),
    )
  })
})
