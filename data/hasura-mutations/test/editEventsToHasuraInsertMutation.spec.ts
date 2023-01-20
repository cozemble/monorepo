import { expect, test } from 'vitest'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { uuids } from '@cozemble/lang-util'
import { hasuraMutationFromEvents } from '../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import { gqlMutation } from '@cozemble/graphql-core'
import { valueChanged } from './helpers'

registerStringProperty()
/**
 * mutation MyMutation {
 *   insert_address(objects: {line_1: "Flat 6", postcode: "CM23 XXX"}) {
 *     returning {
 *       id
 *       line_1
 *       line_2
 *       postcode
 *     }
 *   }
 * }
 **/

/**
 * mutation MyMutation {
 *   insert_invoice(objects: {invoice_id: "22", customer: {data: {first_name: "John", last_name: "Smith", email: "john@email.com", phone: "555-5555-555", address: {data: {line_1: "1 Main Street", line_2: "Toy town", postcode: "CM23 1AA"}}}}}) {
 *     affected_rows
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
 *           postcode
 *         }
 *       }
 *     }
 *   }
 * }
 **/

/**
 * mutation MyMutation {
 *   insert_invoice(objects: {customer: {data: {email: "mike@email.com", first_name: "Mike", last_name: "Smith", phone: "555-5555-555", address: {data: {line_1: "Flat 6", postcode: "CM23 3WW"}}}}, line_items: {data: [{item: "Apple", price: "1.20", quantity: "2"}, {item: "Pear", price: "1.89", quantity: "3"}]}}) {
 *     returning {
 *       id
 *       customer {
 *         id
 *         first_name
 *         last_name
 *         email
 *         phone
 *         address {
 *           id
 *           line_1
 *           line_2
 *           postcode
 *         }
 *       }
 *       line_items {
 *         id
 *         item
 *         price
 *         quantity
 *       }
 *     }
 *   }
 * } **/

const addressModel = testExports.addressModel
const invoiceModel = testExports.invoiceModel
const lineItemModel = testExports.lineItemModel
const invoiceModels = testExports.invoiceModels
const invoiceLineItemsRelationship = testExports.invoiceLineItemsRelationship

test('can create a simple object mutation', () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'test-user')
  const addressLine1 = uuids.v4()
  const addressPostcode = uuids.v4()
  const events = [
    dataRecordEditEvents.recordCreated(addressModel.id, 'user1'),
    valueChanged(addressRecord, addressLine1, 'Line 1'),
    valueChanged(addressRecord, addressPostcode, 'Post code'),
  ]

  const mutation = hasuraMutationFromEvents(invoiceModels, addressRecord, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_address(objects: {line_1: "${addressLine1}", post_code: "${addressPostcode}"}) {
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

test('can create a simple object mutation with a nested-nested object', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'user1')
  const events = [
    dataRecordEditEvents.recordCreated(invoiceModel.id, 'user1'),
    valueChanged(invoiceRecord, '123', 'Invoice ID'),
    valueChanged(invoiceRecord, 'John', 'Customer', 'First name'),
    valueChanged(invoiceRecord, '555-5555-555', 'Customer', 'Phone'),
    valueChanged(invoiceRecord, 'john@email.com', 'Customer', 'Email'),
    valueChanged(invoiceRecord, '1 Main Street', 'Customer', 'Address', 'Line 1'),
    valueChanged(invoiceRecord, 'CM22 6JH', 'Customer', 'Address', 'Post code'),
  ]
  const mutation = hasuraMutationFromEvents(invoiceModels, invoiceRecord, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_invoice(objects: {invoice_id: "123", customer: {data: {first_name: "John", phone: "555-5555-555", email: "john@email.com",address: {data: {line_1: "1 Main Street", post_code: "CM22 6JH"}}}}}) {
    returning {
      id
      invoice_id
      customer {
        id
        first_name
        last_name
        phone
        email
        address {
          id
          line_1
          line_2
          post_code
        }
      }
    }
  }
}`,
    ),
  )
})

test('can create a object mutation with a nested array', () => {
  const invoiceRecord = dataRecordFns.newInstance(invoiceModel, 'user1')
  const twoApples = dataRecordFns.random(invoiceModels, lineItemModel, {
    Name: 'apple',
    Price: '0.85',
    Quantity: '2',
  })
  const onePear = dataRecordFns.random(invoiceModels, lineItemModel, {
    Name: 'pear',
    Price: '0.98',
    Quantity: '1',
  })
  const events = [
    dataRecordEditEvents.recordCreated(invoiceModel.id, 'user1'),
    valueChanged(invoiceRecord, '22', 'Invoice ID'),
    dataRecordEditEvents.hasManyItemAdded(
      invoiceRecord,
      [],
      invoiceLineItemsRelationship,
      twoApples,
    ),
    dataRecordEditEvents.hasManyItemAdded(invoiceRecord, [], invoiceLineItemsRelationship, onePear),
  ]
  const mutation = hasuraMutationFromEvents(invoiceModels, invoiceRecord, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_invoice(objects: {invoice_id: "22", line_items: {data: [{quantity: "2", name: "apple", price: "0.85"}, {quantity: "1", name: "pear", price: "0.98"}]}}) {
    returning {
      id
      invoice_id
      line_items {
        id
        quantity
        name
        price
      }
    }
  }
}
`,
    ),
  )
})
