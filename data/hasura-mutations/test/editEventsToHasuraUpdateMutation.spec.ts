import { expect, test } from 'vitest'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { hasuraMutationFromEvents } from '../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import { gqlMutation } from '@cozemble/graphql-core'
import { valueChanged } from './helpers'

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
  const events = [valueChanged(addressRecord, 'aaaa', 'Line 1')]

  const mutation = hasuraMutationFromEvents(invoiceModels, addressRecord, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update_address(where: {id: {_eq: "${addressRecord.id.value}"}}, _set: {line_1: "aaaa"}) {
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
    valueChanged(invoiceRecord, '245', 'Invoice ID'),
    valueChanged(invoiceRecord, 'Frank', 'Customer', 'First name'),
    valueChanged(invoiceRecord, 'Smith', 'Customer', 'Last name'),
    valueChanged(invoiceRecord, '11 Side Street', 'Customer', 'Address', 'Line 1'),
  ]
  const mutation = hasuraMutationFromEvents(invoiceModels, invoiceRecord, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  update_invoice(where: {id: {_eq: "${invoiceRecord.id.value}"}}, _set: {invoice_id: "245"}) {
    returning {
      id
      invoice_id
    }
  }
  update_customer(where: {id: {_eq: "${customerRecord.id.value}"}}, _set: {first_name: "Frank", last_name: "Smith"}) {
    returning {
      id
      first_name
      last_name
      phone
      email
    }
  }
  update_address(where: {id: {_eq: "${addressRecord.id.value}"}}, _set: {line_1: "11 Side Street"}) {
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
