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
import { modelSlotEvents } from '../src'
import { ModelReference } from '@cozemble/model-core'
import { modelIdFns } from '@cozemble/model-api'

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
      modelReferenceFns.newInstance([], expectedName, 'from', expectedId),
    )
  })

  test('can add a new model.reference', () => {
    const expectedName = modelReferenceNameFns.newInstance('name')
    const expectedId = modelReferenceIdFns.newInstance()
    const event = modelSlotEvents.newModelReference(model.id, expectedName, expectedId)
    const mutatedModel = modelEventDescriptors.applyEvent(model, event)
    expect(mutatedModel.slots[0]).toEqual(property)
    expect(mutatedModel.slots[1]).toEqual(
      modelReferenceFns.newInstance([], expectedName, 'from', expectedId),
    )
  })
})

// describe('given a model with a model.reference', () => {
//   let model: Model
//   let modelReference: ModelReference
//
//   beforeEach(() => {
//     modelReference = modelReferenceFns.newInstance([], modelReferenceNameFns.newInstance('name'))
//     model = modelFns.newInstance('Person', modelOptions.withSlot(modelReference))
//   })
//
//   test('can set the model.reference id', () => {
//     const expectedId = modelIdFns.newInstance()
//     const event = modelSlotEvents.modelReferenceChanged(model.id, modelReference.id, expectedId)
//     const mutatedModel = modelEventDescriptors.applyEvent(model, event)
//     expect(mutatedModel.slots[0]).toEqual(
//       modelReferenceFns.newInstance([expectedId], modelReference.name, 'from', modelReference.id),
//     )
//   })
//
//   test('can clear the model.reference id', () => {
//     const event = modelSlotEvents.modelReferenceChanged(model.id, modelReference.id, null)
//     const mutatedModel = modelEventDescriptors.applyEvent(model, event)
//     expect(mutatedModel.slots[0]).toEqual(
//       modelReferenceFns.newInstance([], modelReference.name, 'from', modelReference.id),
//     )
//   })
// })
