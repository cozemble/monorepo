import { expect, test } from 'vitest'
import { dataRecordFns, modelFns, modelOptions, propertyFns, relationshipFns } from '../src'
import { DataRecord } from '@cozemble/model-core'

test('one level deep has-one relationship', () => {
  const child = modelFns.newInstance('child', modelOptions.withProperty(propertyFns.newInstance()))
  const childRelationship = relationshipFns.newInstance('Child', child.id, 'one')
  const parent = modelFns.newInstance('parent', modelOptions.withRelationships(childRelationship))
  let record = dataRecordFns.newInstance(parent, 'test-user')
  expect(record.values[childRelationship.id.value]).toBeUndefined()
  record = dataRecordFns.fullStructure([parent, child], record)
  expect(record.values[childRelationship.id.value]).toBeDefined()
  const childRecord = record.values[childRelationship.id.value] as DataRecord
  expect(childRecord.modelId).toEqual(child.id)
  expect(childRecord.createdBy.value).toEqual('test-user')
})

test('two levels deep has-one relationship', () => {
  const child = modelFns.newInstance('child', modelOptions.withProperty(propertyFns.newInstance()))
  const childRelationship = relationshipFns.newInstance('Child', child.id, 'one')
  const middle = modelFns.newInstance('middle', modelOptions.withRelationships(childRelationship))
  const middleRelationship = relationshipFns.newInstance('Middle', middle.id, 'one')
  const parent = modelFns.newInstance('parent', modelOptions.withRelationships(middleRelationship))
  let record = dataRecordFns.newInstance(parent, 'test-user')
  expect(record.values[middleRelationship.id.value]).toBeUndefined()
  record = dataRecordFns.fullStructure([parent, middle, child], record)
  expect(record.values[middleRelationship.id.value]).toBeDefined()
  const middleRecord = record.values[middleRelationship.id.value] as DataRecord
  expect(middleRecord.values[childRelationship.id.value]).toBeDefined()
  expect(middleRecord.modelId).toEqual(middle.id)
  expect(middleRecord.createdBy.value).toEqual('test-user')

  const childRecord = middleRecord.values[childRelationship.id.value] as DataRecord
  expect(childRecord.modelId).toEqual(child.id)
  expect(childRecord.createdBy.value).toEqual('test-user')
})

test('two levels deep has-one relationship with middle existing', () => {
  const child = modelFns.newInstance('child', modelOptions.withProperty(propertyFns.newInstance()))
  const childRelationship = relationshipFns.newInstance('Child', child.id, 'one')
  const middle = modelFns.newInstance('middle', modelOptions.withRelationships(childRelationship))
  const middleRelationship = relationshipFns.newInstance('Middle', middle.id, 'one')
  const parent = modelFns.newInstance('parent', modelOptions.withRelationships(middleRelationship))
  let parentRecord = dataRecordFns.newInstance(parent, 'test-user')
  let middleRecord = dataRecordFns.newInstance(middle, 'test-user')
  parentRecord.values[middleRelationship.id.value] = middleRecord
  parentRecord = dataRecordFns.fullStructure([parent, middle, child], parentRecord)

  middleRecord = parentRecord.values[middleRelationship.id.value] as DataRecord
  expect(middleRecord.values[childRelationship.id.value]).toBeDefined()
  expect(middleRecord.modelId).toEqual(middle.id)
  expect(middleRecord.createdBy.value).toEqual('test-user')

  const childRecord = middleRecord.values[childRelationship.id.value] as DataRecord
  expect(childRecord.modelId).toEqual(child.id)
  expect(childRecord.createdBy.value).toEqual('test-user')
})

test('one level deep has-many relationship', () => {
  const child = modelFns.newInstance('child', modelOptions.withProperty(propertyFns.newInstance()))
  const childRelationship = relationshipFns.newInstance('Children', child.id, 'many')
  const parent = modelFns.newInstance('parent', modelOptions.withRelationships(childRelationship))
  let record = dataRecordFns.newInstance(parent, 'test-user')
  expect(record.values[childRelationship.id.value]).toBeUndefined()
  record = dataRecordFns.fullStructure([parent, child], record)
  expect(record.values[childRelationship.id.value]).toEqual([])
})

test('top level has-many with child has-one', () => {
  const child = modelFns.newInstance('child', modelOptions.withProperty(propertyFns.newInstance()))
  const childRelationship = relationshipFns.newInstance('Children', child.id, 'one')
  const middle = modelFns.newInstance('middle', modelOptions.withRelationships(childRelationship))
  const middleRelationship = relationshipFns.newInstance('Middle', middle.id, 'many')

  const parent = modelFns.newInstance('parent', modelOptions.withRelationships(middleRelationship))
  let parentRecord = dataRecordFns.newInstance(parent, 'test-user')
  let middleRecord = dataRecordFns.newInstance(middle, 'test-user')
  parentRecord.values[middleRelationship.id.value] = [middleRecord]
  parentRecord = dataRecordFns.fullStructure([parent, middle, child], parentRecord)

  middleRecord = parentRecord.values[middleRelationship.id.value][0] as DataRecord
  const childRecord = middleRecord.values[childRelationship.id.value] as DataRecord
  expect(childRecord.modelId).toEqual(child.id)
  expect(childRecord.createdBy.value).toEqual('test-user')
})
