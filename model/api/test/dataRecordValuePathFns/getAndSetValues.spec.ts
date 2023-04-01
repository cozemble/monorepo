import { dataRecordFns, dataRecordValuePathFns } from '../../src'
import {
  invoiceLineItemsRelationship,
  invoiceModel,
  invoiceModels,
  lineItemModel,
} from '../../src/invoiceModel'
import { describe, expect, test } from 'vitest'
import { registerStringProperty } from '@cozemble/model-string-core'
import { allModelsWithReferences, modelsWithReferences } from '../../src/modelsWithReferences'
import { referencedRecordsFns } from '@cozemble/model-core'

registerStringProperty()

describe('Given a model path to a has-many nested property', () => {
  const path = dataRecordValuePathFns.fromNames(
    invoiceModels,
    invoiceModel,
    'Line Items.0',
    'Quantity',
  )

  test('getValues returns null when there is no value relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    expect(dataRecordValuePathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns null when there is an empty array for the relationship', () => {
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice[invoiceLineItemsRelationship.id.value] = []
    expect(dataRecordValuePathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns null when the relationship value has nothing for the property', () => {
    const lineItem = dataRecordFns.newInstance(lineItemModel, 'mike')
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordValuePathFns.getValue(path, invoice)).toEqual(null)
  })

  test('getValues returns the value for the relationship value when it is there', () => {
    const lineItem = dataRecordFns.random(invoiceModels, lineItemModel, { Quantity: 'many' })
    const invoice = dataRecordFns.newInstance(invoiceModel, 'mike')
    invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem]
    expect(dataRecordValuePathFns.getValue(path, invoice)).toEqual('many')
  })
})

describe('given a model with a model.reference slot', () => {
  const path = dataRecordValuePathFns.fromNames(
    allModelsWithReferences,
    modelsWithReferences.customerModel,
    'Address',
  )

  test('getValues returns null when there is no value relationship', () => {
    const customer = dataRecordFns.random(
      allModelsWithReferences,
      modelsWithReferences.customerModel,
    )
    expect(dataRecordValuePathFns.getValue(path, customer)).toEqual(null)
  })

  test('getValues returns the record reference when there is a referenced record', () => {
    const address = dataRecordFns.random(allModelsWithReferences, modelsWithReferences.addressModel)
    const reference = referencedRecordsFns.addReference(
      referencedRecordsFns.empty(),
      modelsWithReferences.addressModel.id,
      address.id,
    )
    const customer = dataRecordFns.random(
      allModelsWithReferences,
      modelsWithReferences.customerModel,
      {
        Address: reference,
      },
    )
    expect(dataRecordValuePathFns.getValue(path, customer)).toEqual(reference)
  })

  test('getValues returns the record reference when there is a referenced record', () => {
    const address = dataRecordFns.random(allModelsWithReferences, modelsWithReferences.addressModel)
    const secondAddress = dataRecordFns.random(
      allModelsWithReferences,
      modelsWithReferences.addressModel,
    )
    const customer = dataRecordFns.random(
      allModelsWithReferences,
      modelsWithReferences.customerModel,
      {
        Address: referencedRecordsFns.addReference(
          referencedRecordsFns.empty(),
          modelsWithReferences.addressModel.id,
          address.id,
        ),
      },
    )
    const secondReference = referencedRecordsFns.addReference(
      referencedRecordsFns.empty(),
      modelsWithReferences.addressModel.id,
      secondAddress.id,
    )
    const mutated = dataRecordValuePathFns.setValue(
      allModelsWithReferences,
      path,
      customer,
      secondReference,
    )
    expect(dataRecordValuePathFns.getValue(path, mutated)).toEqual(secondReference)
  })
})
