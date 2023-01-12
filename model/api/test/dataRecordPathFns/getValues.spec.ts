import { dataRecordFns, dataRecordPathFns } from '../../src'
import {
  invoiceLineItemsRelationship,
  invoiceModel,
  invoiceModels,
  lineItemModel,
} from '../../src/invoiceModel'
import { describe, expect, test } from 'vitest'
import { registerStringProperty } from '@cozemble/model-string-core'

registerStringProperty()

describe('Given a model path to a has-many nested property', () => {
  const path = dataRecordPathFns.fromNames(invoiceModels, invoiceModel, 'Line Items.0', 'Quantity')

  test('getValues returns null when there is no value relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    expect(dataRecordPathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns null when there is an empty array for the relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice[invoiceLineItemsRelationship.id.value] = []
    expect(dataRecordPathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns null when the relationship value has nothing for the property', () => {
    const lineItem = dataRecordFns.newInstance(lineItemModel, 'mike')
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordPathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns the value for the relationship value when it is there', () => {
    const lineItem = dataRecordFns.random(invoiceModels, lineItemModel, { Quantity: 'many' })
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordPathFns.getValue(path, invoice)).toEqual('many')
  })
})
