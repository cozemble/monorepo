import { expect, test } from 'vitest'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { hasuraMutationFromEvents } from '../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import { gqlMutation } from '@cozemble/graphql-core'
import { valueChanged } from './helpers'
import { headAndTailFns } from '@cozemble/lang-util'

registerStringProperty()

/**
 * mutation MyMutation {
 *   update_invoice(where: {id: {_eq: 10}}, _set: {invoice_id: "33"}) {
 *     returning {
 *       invoice_id
 *       customer {
 *         first_name
 *         last_name
 *         email
 *         phone
 *         address {
 *           line_1
 *           line_2
 *           post_code
 *         }
 *       }
 *       line_items {
 *         quantity
 *         item
 *         price
 *       }
 *     }
 *   }
 * }
 */
const addressModel = testExports.addressModel
const invoiceModel = testExports.invoiceModel
const lineItemModel = testExports.lineItemModel
const customerModel = testExports.customerModel
const invoiceModels = testExports.invoiceModels
const invoiceLineItemsRelationship = testExports.invoiceLineItemsRelationship

test('can create a simple object mutation', () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'test-user')
  const events = [valueChanged(addressRecord, addressRecord, 'aaaa', 'Line 1')]

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [],
    addressRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update0: update_address(where: {id: {_eq: "${addressRecord.id.value}"}}, _set: {line_1: "aaaa"}) {
    returning {
      id
      line_1
      line_2
      post_code
    }
  }
}`,
    ),
  )
})

test('can create multiple update mutations to update a nested-nested object', () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'user1')
  const customerRecord = dataRecordFns.random(invoiceModels, customerModel, {
    Address: addressRecord,
  })
  const invoiceRecord = dataRecordFns.random(invoiceModels, invoiceModel, {
    Customer: customerRecord,
  })

  const events = [
    valueChanged(invoiceRecord, invoiceRecord, '245', 'Invoice ID'),
    valueChanged(invoiceRecord, customerRecord, 'Frank', 'Customer', 'First name'),
    valueChanged(invoiceRecord, customerRecord, 'Smith', 'Customer', 'Last name'),
    valueChanged(invoiceRecord, addressRecord, '11 Side Street', 'Customer', 'Address', 'Line 1'),
  ]
  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    dataRecordFns.childRecords(invoiceModels, invoiceRecord),
    invoiceRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update0: update_invoice(where: {id: {_eq: "${invoiceRecord.id.value}"}}, _set: {invoice_id: "245"}) {
    returning {
      id
      invoice_id
    }
  }
  update1: update_customer(where: {id: {_eq: "${customerRecord.id.value}"}}, _set: {first_name: "Frank", last_name: "Smith"}) {
    returning {
      id
      first_name
      last_name
      phone
      email
    }
  }
  update2: update_address(where: {id: {_eq: "${addressRecord.id.value}"}}, _set: {line_1: "11 Side Street"}) {
    returning {
      id
      line_1
      line_2
      post_code
    }
  }
}`,
    ),
  )
})

test('can update multiple items in an array relationship', () => {
  const lineItem1 = dataRecordFns.random(invoiceModels, lineItemModel)
  const lineItem2 = dataRecordFns.random(invoiceModels, lineItemModel)
  const invoiceRecord = dataRecordFns.random(invoiceModels, invoiceModel)
  invoiceRecord.values[invoiceLineItemsRelationship.id.value] = [lineItem1, lineItem2]

  const events = [
    valueChanged(invoiceRecord, lineItem1, 'apple', 'Line Items.0', 'Name'),
    valueChanged(invoiceRecord, lineItem1, '0.95', 'Line Items.0', 'Price'),
    valueChanged(invoiceRecord, lineItem2, 'pear', 'Line Items.1', 'Name'),
    valueChanged(invoiceRecord, lineItem2, '0.97', 'Line Items.1', 'Price'),
  ]

  const children = dataRecordFns.childRecords(invoiceModels, invoiceRecord)

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    children,
    invoiceRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update0: update_line_item(where: {id: {_eq: "${lineItem1.id.value}"}}, _set: {name: "apple", price: "0.95"}) {
    returning {
      id
      quantity
      name
      price
    }
  }
  update1: update_line_item(where: {id: {_eq: "${lineItem2.id.value}"}}, _set: {name: "pear", price: "0.97"}) {
    returning {
      id
      quantity
      name
      price
    }
  }
}`,
    ),
  )
})
