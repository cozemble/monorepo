import { describe, expect, test } from 'vitest'
import { dataRecordFns, dataRecordValuePathFns, modelFns, nestedModelFns } from '../../src/index.js'
import { invoiceModel, invoiceModels, lineItemModel } from '../../src/invoiceModel.js'
import type { DataRecord } from '@cozemble/model-core'
import { NestedModel } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import { registerJsonStringProperty } from '@cozemble/model-properties-core'

registerJsonStringProperty()
const systemConfig = systemConfigurationFns.empty()

describe('Given the invoice model', () => {
  test('can add an item to line items', () => {
    const lineItemsRelationship = modelFns.elementByName(invoiceModel, 'Line Items') as NestedModel
    const initialRecord = dataRecordFns.newInstance(invoiceModel, 'mike')
    const newLineItem = dataRecordFns.random(systemConfig, invoiceModels, lineItemModel)
    const mutated = dataRecordValuePathFns.addHasManyItem(
      invoiceModels,
      [],
      lineItemsRelationship,
      initialRecord,
      newLineItem,
    )
    const lineItems = nestedModelFns.getValue(mutated, lineItemsRelationship) as DataRecord[]
    expect(lineItems).toEqual([newLineItem])
  })
})
