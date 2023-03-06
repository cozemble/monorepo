import { JSONSchema7 } from 'json-schema'
import { printSchema } from 'graphql'
import { expect, it } from 'vitest'
import { toEqualIgnoringWhitespace } from './matchers'
import convert from '../src'

expect.extend({ toEqualIgnoringWhitespace })
export interface IJSONSchema7 extends JSONSchema7 {
  title: string
}

const testConversion = (jsonSchema: any, schemaText: string) => {
  const schema = convert({ jsonSchema })
  const actualSchemaText = printSchema(schema)
  expect(actualSchemaText).toEqualIgnoringWhitespace(schemaText)
}

it('correctly converts basic attribute types', () => {
  const jsonSchema: IJSONSchema7 = {
    title: 'Invoice',
    type: 'object',
    properties: {
      invoiceNumber: {
        type: 'string',
        description: 'Invoice Number',
      },
      description: {
        type: 'string',
        description: 'Description of invoice',
      },
      lineItems: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            quantity: {
              type: 'integer',
              minimum: 0,
            },
            item: {
              type: 'string',
            },
            price: {
              type: 'number',
              minimum: 0,
              multipleOf: 0.01,
            },
          },
          required: ['quantity', 'item', 'price'],
        },
      },
      customer: {
        type: 'object',
        properties: {
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          email: {
            type: 'string',
            pattern: '^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$',
          },
          phone: {
            type: 'string',
            pattern: '^[\\+]?[(]?[0-9]{3}[)]?[-\\s\\.]?[0-9]{3}[-\\s\\.]?[0-9]{4,6}$',
          },
          address: {
            type: 'object',
            properties: {
              line1: {
                type: 'string',
              },
              line2: {
                type: 'string',
              },
              postcode: {
                type: 'string',
              },
            },
            required: ['line1', 'postcode'],
          },
        },
        required: ['firstName', 'email', 'phone', 'address'],
      },
    },
    required: ['invoiceNumber', 'customer'],
  }
  const expectedSchemaText = `
    type Query {
      invoices: [Invoice]
    }
    
    """Invoice"""
    type Invoice {
      """Invoice Number"""
      invoiceNumber: String!
    
      """Description of invoice"""
      description: String
      lineItems: [InvoiceLineItems!]
      customer: InvoiceCustomer!
    }
    
    type InvoiceLineItems {
      quantity: Int!
      item: String!
      price: Float!
    }
    
    type InvoiceCustomer {
      firstName: String!
      lastName: String
      email: String!
      phone: String!
      address: InvoiceCustomerAddress!
    }
    
    type InvoiceCustomerAddress {
      line1: String!
      line2: String
      postcode: String!
    }  
  `
  testConversion(jsonSchema, expectedSchemaText)
})
