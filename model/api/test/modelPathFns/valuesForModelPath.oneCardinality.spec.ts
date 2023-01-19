import {
  dataRecordFns,
  dataRecordPathFns,
  modelFns,
  modelOptions,
  modelPathFns,
  propertyFns,
  relationshipFns,
} from '../../src'
import { describe, expect, test } from 'vitest'
import { type HasOneRelationship, type Property, propertyDescriptors } from '@cozemble/model-core'
import {
  singleCardinalityValuesForModelPathResponse,
  valuesForModelPath,
} from '../../src/valuesForModelPath'
import { registerStringProperty } from '@cozemble/model-string-core'
import { dataRecordRecordPathAndValue } from '../../src/modelPathFns'

registerStringProperty()

describe('given a path of invoice.single.anotherSingle.quantity', () => {
  const anotherSingleModel = modelFns.newInstance(
    'Another Single',
    modelOptions.withProperty(propertyFns.newInstance('ID')),
    modelOptions.withProperty(propertyFns.newInstance('Quantity')),
  )
  const [id, quantity] = anotherSingleModel.properties
  const singleModel = modelFns.newInstance(
    'Single',
    modelOptions.withRelationships(
      relationshipFns.newInstance('Another Single', anotherSingleModel.id, 'one'),
    ),
  )
  const invoice = modelFns.newInstance(
    'Invoice',
    modelOptions.withRelationships(relationshipFns.newInstance('Single', singleModel.id, 'one')),
  )
  const models = [invoice, singleModel, anotherSingleModel]
  const path = modelPathFns.fromNames<Property>(
    models,
    invoice,
    'Single',
    'Another Single',
    'Quantity',
  )
  const singleRelationship = path.parentElements[0] as HasOneRelationship
  const anotherSingleRelationship = path.parentElements[1] as HasOneRelationship

  test('given record {} return null', () => {
    const emptyRecord = dataRecordFns.newInstance(invoice, 'user1')
    expect(valuesForModelPath(models, path, emptyRecord)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          null,
        ),
      ),
    )
  })

  test('given record {single:{}} return null', () => {
    const single = dataRecordFns.newInstance(singleModel, 'user1')
    let record = dataRecordFns.newInstance(invoice, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          null,
        ),
      ),
    )
  })

  test('given record {single:{anotherSingle:{}}}  return {null}', () => {
    const anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    single = relationshipFns.setValue(models, single, anotherSingleRelationship, anotherSingle)
    let record = dataRecordFns.newInstance(invoice, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          null,
        ),
      ),
    )
  })

  test('given record {single:{anotherSingle:{id:1}}}  return {null}', () => {
    let anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle = propertyDescriptors
      .mandatory(id.propertyType)
      .setValue(anotherSingle, anotherSingle, '1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    single = relationshipFns.setValue(models, single, anotherSingleRelationship, anotherSingle)
    let record = dataRecordFns.newInstance(invoice, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          null,
        ),
      ),
    )
  })

  test('given record {single:{anotherSingle:{id:1, quantity:2}}}  return {2}', () => {
    let anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle = propertyDescriptors.mandatory(id.propertyType).setValue(id, anotherSingle, '1')
    anotherSingle = propertyDescriptors
      .mandatory(quantity.propertyType)
      .setValue(quantity, anotherSingle, '2')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    single = relationshipFns.setValue(models, single, anotherSingleRelationship, anotherSingle)
    let record = dataRecordFns.newInstance(invoice, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          '2',
        ),
      ),
    )
  })

  test('given record {single:{anotherSingle:{quantity:null}}}  return {null}', () => {
    let anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle = propertyDescriptors
      .mandatory(quantity.propertyType)
      .setValue(quantity, anotherSingle, null)
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    single = relationshipFns.setValue(models, single, anotherSingleRelationship, anotherSingle)
    let record = dataRecordFns.newInstance(invoice, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      singleCardinalityValuesForModelPathResponse(
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(quantity, singleRelationship, anotherSingleRelationship),
          null,
        ),
      ),
    )
  })
})
