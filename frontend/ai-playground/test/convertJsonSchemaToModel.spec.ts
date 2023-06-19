import { expect, test } from 'vitest'
import { JsonSchema, Property } from '@cozemble/model-core'
import { convertSchemaToModels } from '../src/lib/generative/components/helpers'
import { registerJsonProperties } from '@cozemble/model-properties-core'
import { mandatory } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'

const customerSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'test-customer-schema',
  title: 'Customer',
  pluralTitle: 'Customers',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      unique: true,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    phoneNumber: {
      type: 'string',
      format: 'phone',
    },
    address: {
      type: 'object',
      properties: {
        street: {
          type: 'string',
        },
        city: {
          type: 'string',
        },
        state: {
          type: 'string',
        },
        zipCode: {
          type: 'string',
          format: 'postcode',
        },
      },
      required: ['street', 'city', 'state', 'zipCode'],
    },
  },
  required: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'address'],
}

const invoiceSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'test-invoice-schema',
  type: 'object',
  properties: {
    invoiceId: {
      type: 'string',
      description: 'The unique identifier for the invoice',
    },
    billingDate: {
      type: 'string',
      format: 'date',
      description: 'The date when the invoice was issued',
    },
    dueDate: {
      type: 'string',
      format: 'date',
      description: 'The date when the payment is due',
    },
    billingCompany: {
      type: 'string',
      description: 'The name of the company issuing the invoice',
    },
    customerName: {
      type: 'string',
      description: 'The name of the customer',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
            description: 'A description of the item',
          },
          quantity: {
            type: 'number',
            description: 'The quantity of the item',
          },
          price: {
            type: 'number',
            description: 'The price per unit of the item',
          },
        },
        required: ['description', 'quantity', 'price'],
      },
    },
    totalAmount: {
      type: 'number',
      description: 'The total amount due',
    },
  },
  required: [
    'invoiceId',
    'billingDate',
    'dueDate',
    'billingCompany',
    'customerName',
    'items',
    'totalAmount',
  ],
}

const actualInvoiceSchema1: JsonSchema = {
  title: 'Invoice',
  pluralTitle: 'Invoices',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      unique: true,
    },
    customerName: {
      type: 'string',
    },
    customerAddress: {
      type: 'string',
    },
    invoiceDate: {
      type: 'string',
      format: 'date',
    },
    dueDate: {
      type: 'string',
      format: 'date',
    },
    totalAmount: {
      type: 'number',
    },
    taxRate: {
      type: 'number',
    },
    discount: {
      type: 'number',
    },
    lineItems: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
          },
          quantity: {
            type: 'integer',
          },
          price: {
            type: 'number',
          },
        },
        required: ['item', 'quantity', 'price'],
      },
    },
  },
  required: ['id', 'customerName', 'invoiceDate', 'dueDate', 'totalAmount'],
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'generated-schema1687158831737',
}

registerJsonProperties()

test('can convert customer response', () => {
  const { model, allModels } = convertSchemaToModels(customerSchema)
  expect(model.slots.map((slot) => slot.name.value)).toEqual([
    'Id',
    'First Name',
    'Last Name',
    'Email',
    'Phone Number',
  ])
  expect((model.slots[0] as Property).required).toBe(true)
  expect((model.slots[0] as Property).unique).toBe(true)
  expect((model.slots[4] as Property).propertyType.value).toBe('json.phoneNumber.property')
  expect(model.nestedModels).toHaveLength(1)
  expect(allModels.length).toBe(2)
  const addressModel = mandatory(
    allModels.find((model) => model.name.value === 'Address'),
    `Address model not found`,
  )
  expect(model.nestedModels[0].modelId.value).toBe(addressModel.id.value)
  expect(model.nestedModels[0].cardinality).toBe('one')
  expect(addressModel.slots.map((slot) => slot.name.value)).toEqual([
    'Street',
    'City',
    'State',
    'Zip Code',
  ])
  expect((addressModel.slots[0] as Property).required).toBe(true)
})

test('can handle arrays', () => {
  const { model, allModels } = convertSchemaToModels(invoiceSchema)
  expect(model.slots.map((slot) => slot.name.value)).toEqual([
    'Invoice Id',
    'Billing Date',
    'Due Date',
    'Billing Company',
    'Customer Name',
    'Total Amount',
  ])
  expect(model.nestedModels).toHaveLength(1)
  expect(model.nestedModels[0].cardinality).toBe('many')

  const itemsModel = modelFns.findById(allModels, model.nestedModels[0].modelId)
  expect(itemsModel.slots.map((slot) => slot.name.value)).toEqual([
    'Description',
    'Quantity',
    'Price',
  ])
  expect((itemsModel.slots[0] as Property).required).toBe(true)
})

test("can handle schema with 'actual' schema", () => {
  const { model, allModels } = convertSchemaToModels(actualInvoiceSchema1)
  expect(allModels).toHaveLength(2)
  const [invoiceModel, lineItemModel] = allModels
  expect(lineItemModel.slots.map((slot) => slot.name.value)).toEqual(['Item', 'Quantity', 'Price'])
})
