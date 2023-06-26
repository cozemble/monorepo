import { expect, test } from 'vitest'
import { testExports } from '@cozemble/model-api'
import { modelToJson } from '../src'
import { jsonToRecord } from '../src/jsonToRecord'

const invoiceModels = testExports.invoiceModels
const invoiceModel = testExports.invoiceModel

test('can convert an invoice json object to a record, given the appropriate model', () => {
  const inputInvoiceJson = {
    invoiceId: 'invoice#33',
    customer: {
      firstName: 'John',
      lastName: 'Smith',
      phone: '1234567890',
      email: 'john@email.com',
      address: {
        line1: '123 Main St',
        line2: 'Town X',
        postCode: '12345',
      },
    },
    lineItems: [
      {
        quantity: '1',
        name: 'Item 1',
        price: '10.00',
      },
      {
        quantity: '2',
        name: 'Item 2',
        price: '20.00',
      },
    ],
  }
  const record = jsonToRecord(invoiceModels, invoiceModel, 'test-user', inputInvoiceJson)
  const json = modelToJson(invoiceModels, record)
  const expectedInvoiceJson = {
    'Invoice ID': 'invoice#33',
    Customer: {
      'First name': 'John',
      'Last name': 'Smith',
      Phone: '1234567890',
      Email: 'john@email.com',
      Address: {
        'Line 1': '123 Main St',
        'Line 2': 'Town X',
        'Post code': '12345',
      },
    },
    'Line Items': [
      {
        Quantity: '1',
        Name: 'Item 1',
        Price: '10.00',
      },
      {
        Quantity: '2',
        Name: 'Item 2',
        Price: '20.00',
      },
    ],
  }

  expect(json).toEqual(expectedInvoiceJson)
})
