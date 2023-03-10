import { expect, test } from 'vitest'
import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordFns, testExports } from '@cozemble/model-api'
import { headAndTailFns, uuids } from '@cozemble/lang-util'
import { hasuraMutationFromEvents } from '../src'
import { registerStringProperty } from '@cozemble/model-string-core'
import { gqlMutation } from '@cozemble/graphql-core'
import { valueChanged } from './helpers'
import type { DataRecordAndPath } from '@cozemble/model-core'
import { dataRecordAndPathFns } from '@cozemble/model-core'

registerStringProperty()

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
    dataRecordEditEvents.recordCreated(addressModel.id, addressRecord.id, 'user1'),
    valueChanged(addressRecord, addressRecord, addressLine1, 'Line 1'),
    valueChanged(addressRecord, addressRecord, addressPostcode, 'Post code'),
  ]

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [dataRecordAndPathFns.newInstance(addressRecord, [])],
    addressRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_address(objects: {id:"${addressRecord.id.value}", line_1: "${addressLine1}", post_code: "${addressPostcode}"}) {
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
  const invoiceRecord = dataRecordFns.fullStructure(
    invoiceModels,
    dataRecordFns.newInstance(invoiceModel, 'user1'),
  )
  const children: DataRecordAndPath[] = dataRecordFns.childRecords(invoiceModels, invoiceRecord)
  const customerRecord = children[0].record
  const addressRecord = children[1].record

  const events = [
    dataRecordEditEvents.recordCreated(invoiceModel.id, invoiceRecord.id, 'user1'),
    valueChanged(invoiceRecord, invoiceRecord, '123', 'Invoice ID'),
    valueChanged(invoiceRecord, customerRecord, 'John', 'Customer', 'First name'),
    valueChanged(invoiceRecord, customerRecord, '555-5555-555', 'Customer', 'Phone'),
    valueChanged(invoiceRecord, customerRecord, 'john@email.com', 'Customer', 'Email'),
    valueChanged(invoiceRecord, addressRecord, '1 Main Street', 'Customer', 'Address', 'Line 1'),
    valueChanged(invoiceRecord, addressRecord, 'CM22 6JH', 'Customer', 'Address', 'Post code'),
  ]
  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    children,
    invoiceRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_invoice(objects: {id:"${invoiceRecord.id.value}", invoice_id: "123", customer: {data: {id:"${customerRecord.id.value}",first_name: "John", phone: "555-5555-555", email: "john@email.com",address: {data: {id:"${addressRecord.id.value}", line_1: "1 Main Street", post_code: "CM22 6JH"}}}}}) {
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
    dataRecordEditEvents.recordCreated(invoiceModel.id, invoiceRecord.id, 'user1'),
    valueChanged(invoiceRecord, invoiceRecord, '22', 'Invoice ID'),
    dataRecordEditEvents.hasManyItemAdded(
      invoiceRecord,
      [],
      invoiceLineItemsRelationship,
      twoApples,
    ),
    dataRecordEditEvents.hasManyItemAdded(invoiceRecord, [], invoiceLineItemsRelationship, onePear),
  ]
  const children: DataRecordAndPath[] = dataRecordFns.childRecords(invoiceModels, invoiceRecord)

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    children,
    invoiceRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_invoice(objects: {id:"${invoiceRecord.id.value}",invoice_id: "22", line_items: {data: [{id:"${twoApples.id.value}",quantity: "2", name: "apple", price: "0.85"}, {id:"${onePear.id.value}",quantity: "1", name: "pear", price: "0.98"}]}}) {
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

test("multiple value change events for the same field don't cause multiple updates", () => {
  const addressRecord = dataRecordFns.newInstance(addressModel, 'test-user')
  const events = [
    dataRecordEditEvents.recordCreated(addressModel.id, addressRecord.id, 'user1'),
    valueChanged(addressRecord, addressRecord, '1 Main Street', 'Line 1'),
    valueChanged(addressRecord, addressRecord, '2 Main Street', 'Line 1'),
  ]

  const mutation = hasuraMutationFromEvents(
    invoiceModels,
    [dataRecordAndPathFns.newInstance(addressRecord, [])],
    addressRecord,
    headAndTailFns.fromArray(events),
  )
  expect(mutation).toEqual(
    gqlMutation(
      `mutation MyMutation {
  insert_address(objects: {id:"${addressRecord.id.value}", line_1: "2 Main Street"}) {
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
