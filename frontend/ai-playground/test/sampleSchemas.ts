import { JsonSchema } from '@cozemble/model-core'

export const customerSchema: JsonSchema = {
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
        },
      },
      required: ['street', 'city', 'state', 'zipCode'],
    },
  },
  required: ['id', 'firstName', 'lastName', 'email', 'phoneNumber'],
}

export const invoiceSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'test-invoice-schema',
  title: 'Invoice',
  pluralTitle: 'Invoices',
  type: 'object',
  properties: {
    invoiceId: {
      type: 'string',
    },
    billingDate: {
      type: 'string',
      format: 'date',
    },
    dueDate: {
      type: 'string',
      format: 'date',
    },
    billingCompany: {
      type: 'string',
    },
    customerName: {
      type: 'string',
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          description: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
          price: {
            type: 'number',
          },
        },
        required: ['description', 'quantity', 'price'],
      },
    },
    totalAmount: {
      type: 'number',
    },
  },
  required: [
    'invoiceId',
    'billingDate',
    'dueDate',
    'billingCompany',
    'customerName',
    'totalAmount',
  ],
}

export const actualInvoiceSchema1: JsonSchema = {
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
