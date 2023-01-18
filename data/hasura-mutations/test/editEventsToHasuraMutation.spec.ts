import { expect, test } from 'vitest'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordFns, dataRecordPathFns, modelFns, testExports } from '@cozemble/model-api'
import { uuids } from '@cozemble/lang-util'
import type { DataRecord } from '@cozemble/model-core'
import { gqlMutation } from '../src/graphql/core'
import { hasuraMutationFromEvents } from '../src/HasuraInsertMutationBuilder'

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
const invoiceModels = testExports.invoiceModels

test('can create a simple object mutation', () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'test-user')
  const addressLine1 = uuids.v4()
  const addressPostcode = uuids.v4()
  const events = [
    dataRecordEditEvents.recordCreated(addressModel.id, 'user1'),
    valueChanged(addressRecord, addressLine1, 'Line 1'),
    valueChanged(addressRecord, addressPostcode, 'Post code'),
  ]

  const mutation = hasuraMutationFromEvents(invoiceModels, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_address(objects: {line_1: "${addressLine1}", post_code: "${addressPostcode}"}) {
    returning {
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
  const mutation = hasuraMutationFromEvents(invoiceModels, events)
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_invoice(objects: {invoice_id: "123", customer: {data: {first_name: "John", phone: "555-5555-555", email: "john@email.com",address: {data: {line_1: "1 Main Street", post_code: "CM22 6JH"}}}}}) {
    returning {
      invoice_id
      customer {
        first_name
        last_name
        phone
        email
        address {
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

function valueChanged(record: DataRecord, value: string, ...pathNames: string[]) {
  const model = modelFns.findById(invoiceModels, record.modelId)
  return dataRecordEditEvents.valueChanged(
    record,
    dataRecordPathFns.fromNames(invoiceModels, model, ...pathNames),
    null,
    value,
    null,
  )
}
