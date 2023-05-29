import { describe, expect, test } from 'vitest'
import {
  dataRecordIdFns,
  modelIdFns,
  modelReferenceFns,
  modelReferenceIdFns,
  recordGraphEdgeFns,
} from '../src'

describe('given a many-to-one model reference', () => {
  const originModelId = modelIdFns.newInstance('originModelId')
  const referenceModelId = modelIdFns.newInstance('referenceModelId')
  const modelReference = modelReferenceFns.newInstance(
    originModelId,
    [referenceModelId],
    'reference',
    false,
    modelReferenceIdFns.newInstance(),
    'many',
    'one',
  )
  const originRecordId = dataRecordIdFns.newInstance('originRecordId')
  const referenceRecordId = dataRecordIdFns.newInstance('referenceRecordId')
  const proposed = recordGraphEdgeFns.newInstance(
    modelReference.id,
    originModelId,
    referenceModelId,
    originRecordId,
    referenceRecordId,
  )
  describe('proposeEdge', () => {
    test('returns the proposed edge if there are no existing edges', () => {
      expect(recordGraphEdgeFns.proposeEdge(modelReference, [], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns the proposed edge if there are only edges for a different model reference', () => {
      const otherModelReference = modelReferenceFns.newInstance(
        modelIdFns.newInstance(),
        modelIdFns.newInstance(),
        'other',
      )
      const otherEdge = recordGraphEdgeFns.newInstance(
        otherModelReference.id,
        originModelId,
        referenceModelId,
        originRecordId,
        referenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [otherEdge], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns the proposed edge if no other edge is consuming the referenced has-one record', () => {
      const otherReferenceRecordId = dataRecordIdFns.newInstance('otherReferenceRecordId')
      const otherEdge = recordGraphEdgeFns.newInstance(
        modelReference.id,
        originModelId,
        referenceModelId,
        originRecordId,
        otherReferenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [otherEdge], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns the proposed edge if the other edge consuning the referenced has-one record also has the same origin record id', () => {
      const otherEdge = recordGraphEdgeFns.newInstance(
        modelReference.id,
        originModelId,
        referenceModelId,
        originRecordId,
        referenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [otherEdge], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns a changed version of the existing edge if is consuming the referenced has-one record', () => {
      const otherOriginRecordId = dataRecordIdFns.newInstance('otherOriginRecordId')
      const existingEdge = recordGraphEdgeFns.newInstance(
        modelReference.id,
        originModelId,
        referenceModelId,
        otherOriginRecordId,
        referenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [existingEdge], proposed)).toEqual({
        proposed,
        accepted: {
          ...existingEdge,
          originRecordId,
        },
      })
    })
  })
})

describe('given a one-to-many model reference', () => {
  const originModelId = modelIdFns.newInstance('originModelId')
  const referenceModelId = modelIdFns.newInstance('referenceModelId')
  const modelReference = modelReferenceFns.newInstance(
    originModelId,
    [referenceModelId],
    'reference',
    false,
    modelReferenceIdFns.newInstance(),
    'one',
    'many',
  )
  const originRecordId = dataRecordIdFns.newInstance('originRecordId')
  const referenceRecordId = dataRecordIdFns.newInstance('referenceRecordId')
  const proposed = recordGraphEdgeFns.newInstance(
    modelReference.id,
    originModelId,
    referenceModelId,
    originRecordId,
    referenceRecordId,
  )
  describe('proposeEdge', () => {
    test('returns the proposed edge if there are no existing edges', () => {
      expect(recordGraphEdgeFns.proposeEdge(modelReference, [], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns the proposed edge if there are only edges for a different model reference', () => {
      const otherModelReference = modelReferenceFns.newInstance(
        modelIdFns.newInstance(),
        modelIdFns.newInstance(),
        'other',
      )
      const otherEdge = recordGraphEdgeFns.newInstance(
        otherModelReference.id,
        originModelId,
        referenceModelId,
        originRecordId,
        referenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [otherEdge], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns the proposed edge if no other edge is consuming the origin has-one record', () => {
      const otherOriginRecordId = dataRecordIdFns.newInstance('otherOriginRecordId')
      const otherEdge = recordGraphEdgeFns.newInstance(
        modelReference.id,
        originModelId,
        referenceModelId,
        otherOriginRecordId,
        referenceRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [otherEdge], proposed)).toEqual({
        proposed,
        accepted: proposed,
      })
    })

    test('returns a changed version of the existing edge if is consuming the referenced has-one record', () => {
      const otherReferencedRecordId = dataRecordIdFns.newInstance('otherReferencedRecordId')
      const existingEdge = recordGraphEdgeFns.newInstance(
        modelReference.id,
        originModelId,
        referenceModelId,
        originRecordId,
        otherReferencedRecordId,
      )

      expect(recordGraphEdgeFns.proposeEdge(modelReference, [existingEdge], proposed)).toEqual({
        proposed,
        accepted: {
          ...existingEdge,
          referenceRecordId,
        },
      })
    })
  })
})
