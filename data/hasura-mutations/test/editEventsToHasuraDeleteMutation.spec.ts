import { expect, test } from 'vitest'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { registerStringProperty } from '@cozemble/model-string-core'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { hasuraMutationFromEvents } from '../src'
import { headAndTailFns } from '@cozemble/lang-util'
import { gqlMutation } from '@cozemble/graphql-core'
import { valueChanged } from './helpers'

registerStringProperty()

const invoiceModel = testExports.invoiceModel
const lineItemModel = testExports.lineItemModel
const invoiceModels = testExports.invoiceModels
const invoiceLineItemsRelationship = testExports.invoiceLineItemsRelationship

test('can create a root object', () => {
  const invoice = dataRecordFns.random(invoiceModels, invoiceModel)
  const events = [dataRecordEditEvents.recordDeleted(invoiceModel.id, invoice.id, 'user1')]

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [],
    invoice,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  delete0: delete_invoice(where: {id: {_eq: "${invoice.id.value}"}}) {
    affected_rows
  }
}`,
    ),
  )
})

test('updating a has-many record, then deleting it', () => {
  const lineItem1 = dataRecordFns.random(invoiceModels, lineItemModel)
  const invoice = dataRecordFns.random(invoiceModels, invoiceModel)
  invoice.values[invoiceLineItemsRelationship.id.value] = [lineItem1]

  const events = [
    valueChanged(invoice, lineItem1, 'apple', 'Line Items.0', 'Name'),
    dataRecordEditEvents.recordDeleted(lineItem1.modelId, lineItem1.id, 'user1'),
  ]
  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [],
    invoice,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update0: update_line_item(where: {id: {_eq: "${lineItem1.id.value}"}}, _set: {name: "apple"}) {
    returning {
      id
      quantity
      name
      price
    }
  }      
  delete1: delete_line_item(where: {id: {_eq: "${lineItem1.id.value}"}}) {
    affected_rows
  }
}`,
    ),
  )
})
