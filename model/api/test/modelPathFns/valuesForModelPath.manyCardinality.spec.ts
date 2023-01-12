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
import {
  HasManyRelationship,
  HasOneRelationship,
  Property,
  propertyDescriptors,
} from '@cozemble/model-core'
import { dataRecordRecordPathAndValue } from '../../src/modelPathFns'
import { registerStringProperty } from '@cozemble/model-string-core'
import {
  manyCardinalityValuesForModelPathResponse,
  valuesForModelPath,
} from '../../src/valuesForModelPath'

registerStringProperty()

describe('given a path of invoice.single.lineItems.anotherSingle.quantity', () => {
  const anotherSingleModel = modelFns.newInstance(
    'Another Single',
    modelOptions.withProperty(propertyFns.newInstance('ID')),
    modelOptions.withProperty(propertyFns.newInstance('Quantity')),
  )
  const [id, quantity] = anotherSingleModel.properties
  const lineItemsModel = modelFns.newInstance(
    'Line Items',
    modelOptions.withRelationships(
      relationshipFns.newInstance('Another Single', anotherSingleModel.id, 'one'),
    ),
  )
  const singleModel = modelFns.newInstance(
    'Single',
    modelOptions.withRelationships(
      relationshipFns.newInstance('Line Items', lineItemsModel.id, 'many'),
    ),
  )
  const invoice = modelFns.newInstance(
    'Invoice',
    modelOptions.withRelationships(relationshipFns.newInstance('Single', singleModel.id, 'one')),
  )
  const models = [invoice, singleModel, lineItemsModel, anotherSingleModel]
  const path = modelPathFns.fromNames<Property>(
    models,
    invoice,
    'Single',
    'Line Items',
    'Another Single',
    'Quantity',
  )
  const singleRelationship = path.parentElements[0] as HasOneRelationship
  const lineItemsRelationship = path.parentElements[1] as HasManyRelationship
  const anotherSingleRelationship = path.parentElements[2] as HasOneRelationship

  test('given record {} return []', () => {
    const emptyRecord = dataRecordFns.newInstance(invoice, 'user1')
    expect(valuesForModelPath(models, path, emptyRecord)).toEqual(
      manyCardinalityValuesForModelPathResponse([]),
    )
  })

  test('given record {single:{}} return []', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    const single = dataRecordFns.newInstance(singleModel, 'user1')
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([]),
    )
  })

  test('given record {single:{lineItems:[]}} return []', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    const lineItems = []
    single = relationshipFns.setValue(models, single, lineItemsRelationship, lineItems)
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([]),
    )
  })

  test('given record {single:{lineItems:[{anotherSingle:{}}]}}  return [null]', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    let lineItem = dataRecordFns.newInstance(lineItemsModel, 'user1')
    const anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    lineItem = relationshipFns.setValue(models, lineItem, anotherSingleRelationship, anotherSingle)
    const lineItems = [lineItem]
    single = relationshipFns.setValue(models, single, lineItemsRelationship, lineItems)
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(
            quantity,
            singleRelationship,
            dataRecordPathFns.newHasManyRelationshipPathElement(lineItemsRelationship, 0),
            anotherSingleRelationship,
          ),
          null,
        ),
      ]),
    )
  })

  test('given record {single:{lineItems:[{anotherSingle:{id:2}}]}}  return [null]', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    let lineItem = dataRecordFns.newInstance(lineItemsModel, 'user1')
    let anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle = propertyDescriptors.get(id.propertyType).setValue(id, anotherSingle, 2)
    lineItem = relationshipFns.setValue(models, lineItem, anotherSingleRelationship, anotherSingle)
    const lineItems = [lineItem]
    single = relationshipFns.setValue(models, single, lineItemsRelationship, lineItems)
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(
            quantity,
            singleRelationship,
            dataRecordPathFns.newHasManyRelationshipPathElement(lineItemsRelationship, 0),
            anotherSingleRelationship,
          ),
          null,
        ),
      ]),
    )
  })

  test('given record {single:{lineItems:[{anotherSingle:{quantity:3}}]}}  return [3]', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    let lineItem = dataRecordFns.newInstance(lineItemsModel, 'user1')
    let anotherSingle = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle = propertyDescriptors.get(id.propertyType).setValue(id, anotherSingle, 2)
    anotherSingle = propertyDescriptors
      .get(quantity.propertyType)
      .setValue(quantity, anotherSingle, 3)
    lineItem = relationshipFns.setValue(models, lineItem, anotherSingleRelationship, anotherSingle)
    const lineItems = [lineItem]
    single = relationshipFns.setValue(models, single, lineItemsRelationship, lineItems)
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(
            quantity,
            singleRelationship,
            dataRecordPathFns.newHasManyRelationshipPathElement(lineItemsRelationship, 0),
            anotherSingleRelationship,
          ),
          3,
        ),
      ]),
    )
  })

  test('given record {single:{lineItems:[{anotherSingle:{quantity:3}}, {anotherSingle:{quantity:4}}]}}  return [3, 4]', () => {
    let record = dataRecordFns.newInstance(invoice, 'user1')
    let single = dataRecordFns.newInstance(singleModel, 'user1')
    let lineItem1 = dataRecordFns.newInstance(lineItemsModel, 'user1')
    let anotherSingle1 = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle1 = propertyDescriptors.get(id.propertyType).setValue(id, anotherSingle1, 2)
    anotherSingle1 = propertyDescriptors
      .get(quantity.propertyType)
      .setValue(quantity, anotherSingle1, 3)
    lineItem1 = relationshipFns.setValue(
      models,
      lineItem1,
      anotherSingleRelationship,
      anotherSingle1,
    )
    let lineItem2 = dataRecordFns.newInstance(lineItemsModel, 'user1')
    let anotherSingle2 = dataRecordFns.newInstance(anotherSingleModel, 'user1')
    anotherSingle2 = propertyDescriptors.get(id.propertyType).setValue(id, anotherSingle2, 2)
    anotherSingle2 = propertyDescriptors
      .get(quantity.propertyType)
      .setValue(quantity, anotherSingle2, 4)
    lineItem2 = relationshipFns.setValue(
      models,
      lineItem2,
      anotherSingleRelationship,
      anotherSingle2,
    )
    const lineItems = [lineItem1, lineItem2]
    single = relationshipFns.setValue(models, single, lineItemsRelationship, lineItems)
    record = relationshipFns.setValue(models, record, singleRelationship, single)
    expect(valuesForModelPath(models, path, record)).toEqual(
      manyCardinalityValuesForModelPathResponse([
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(
            quantity,
            singleRelationship,
            dataRecordPathFns.newHasManyRelationshipPathElement(lineItemsRelationship, 0),
            anotherSingleRelationship,
          ),
          3,
        ),
        dataRecordRecordPathAndValue(
          dataRecordPathFns.newInstance(
            quantity,
            singleRelationship,
            dataRecordPathFns.newHasManyRelationshipPathElement(lineItemsRelationship, 1),
            anotherSingleRelationship,
          ),
          4,
        ),
      ]),
    )
  })
})
