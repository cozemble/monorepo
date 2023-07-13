import { dataRecordFns, dataRecordValuePathFns } from '../../src'
import {
  invoiceLineItemsRelationship,
  invoiceModel,
  invoiceModels,
  lineItemModel,
} from '../../src/invoiceModel'
import { describe, expect, test } from 'vitest'
import { allModelsWithReferences, modelsWithReferences } from '../../src/modelsWithReferences.js'
import { modelReferenceValuePlaceholder, systemConfigurationFns } from '@cozemble/model-core'
import { registerJsonStringProperty } from '@cozemble/model-properties-core'

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given a model path to a has-many nested property', () => {
  const path = dataRecordValuePathFns.fromNames(
    invoiceModels,
    invoiceModel,
    'Line Items.0',
    'Quantity',
  )

  test('getValues returns null when there is no value relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    expect(dataRecordValuePathFns.getValue(systemConfig, path, invoice)).toEqual(null)
  })

  test('getValues returns null when there is an empty array for the relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice[invoiceLineItemsRelationship.id.value] = []
    expect(dataRecordValuePathFns.getValue(systemConfig, path, invoice)).toEqual(null)
  })

  test('getValues returns null when the relationship value has nothing for the property', () => {
    const lineItem = dataRecordFns.newInstance(lineItemModel, 'mike')
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordValuePathFns.getValue(systemConfig, path, invoice)).toEqual(null)
  })

  test('getValues returns the value for the relationship value when it is there', () => {
    const lineItem = dataRecordFns.random(systemConfig, invoiceModels, lineItemModel, {
      Quantity: 'many',
    })
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordValuePathFns.getValue(systemConfig, path, invoice)).toEqual('many')
  })
})

describe('given a model with a model.reference slot', () => {
  const path = dataRecordValuePathFns.fromNames(
    allModelsWithReferences,
    modelsWithReferences.customerModel,
    'Address',
  )

  test('getValues returns the model reference value placeholder', () => {
    const customer = dataRecordFns.random(
      systemConfig,
      allModelsWithReferences,
      modelsWithReferences.customerModel,
    )
    expect(dataRecordValuePathFns.getValue(systemConfig, path, customer)).toEqual(
      modelReferenceValuePlaceholder,
    )
  })
})
