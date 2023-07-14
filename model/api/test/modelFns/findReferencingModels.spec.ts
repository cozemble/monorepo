import { describe, expect, test } from 'vitest'
import { modelFns } from '../../src/index.js'
import { allModelsWithReferences, modelsWithReferences } from '../../src/modelsWithReferences.js'

describe('findInboundReferences', () => {
  test('returns empty array if there are no inbound references', () => {
    const referencingModels = modelFns.findInboundReferences(
      allModelsWithReferences,
      modelsWithReferences.invoiceModel,
    )
    expect(referencingModels).toEqual([])
  })

  test('returns models that have inbound references', () => {
    const referencingModels = modelFns.findInboundReferences(
      allModelsWithReferences,
      modelsWithReferences.customerModel,
    )
    expect(referencingModels).toEqual([modelsWithReferences.invoiceModel])
  })
})
