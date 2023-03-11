import { printSchema } from 'graphql'
import { expect, it } from 'vitest'
import { toEqualIgnoringWhitespace } from './matchers'
import convert from '../src'
import { IJSONSchema7 } from '../src/lib'

expect.extend({ toEqualIgnoringWhitespace })

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

it('handles enum with numeric keys', () => {
  const jsonSchema: IJSONSchema7 = {
    title: 'Person',
    type: 'object',
    properties: {
      age: {
        type: 'string',
        enum: ['1', '10', '100'],
      },
    },
  }

  const expectedSchemaText = `
    type Query {
      people: [Person]
    }
    
    """Person"""
    type Person {
      age: PersonAge
    }
    
    enum PersonAge {
      VALUE_1
      VALUE_10
      VALUE_100
    }  
  `
  testConversion(jsonSchema, expectedSchemaText)
})

it('handles a model reference', () => {
  const profile = {
    title: 'Profile',
    type: 'object',
    properties: {
      address: { type: 'string' },
      city: { type: 'string' },
      state: { type: 'string' },
    },
  }
  const user = {
    title: 'User',
    type: 'object',
    properties: {
      first_name: { type: 'string' },
      last_name: { type: 'string' },
      email: { type: 'string' },
      profile: {
        $ref: 'Profile',
      },
    },
  }
  const expectedSchemaText = `
    type Query {
      profiles: [Profile]
      users: [User]
    }

    """Profile"""
    type Profile {
      address: String
      city: String
      state: String
    }

    """User"""
    type User {
      first_name: String
      last_name: String
      email: String
      profile: Profile
    }`

  testConversion([profile, user], expectedSchemaText)
})

it('converts `oneOf` schemas (with if/then) to union types', () => {
  const parent: IJSONSchema7 = {
    title: 'Parent',
    type: 'object',
    properties: {
      type: { type: 'string' },
      name: { type: 'string' },
    },
  }
  const child: IJSONSchema7 = {
    title: 'Child',
    type: 'object',
    properties: {
      type: { type: 'string' },
      name: { type: 'string' },
      parent: { $ref: 'Parent' },
      bestFriend: { $ref: 'Person' },
      friends: {
        type: 'array',
        items: { $ref: 'Person' },
      },
    },
  }
  const person: IJSONSchema7 = {
    title: 'Person',
    oneOf: [
      {
        if: { properties: { type: { const: 'Parent' } } },
        then: { $ref: 'Parent' },
      },
      {
        if: { properties: { type: { const: 'Child' } } },
        then: { $ref: 'Child' },
      },
    ],
  }
  const expectedSchemaText = `
  type Query {
    parents: [Parent]
    children: [Child]
    people: [Person]
  }
  
  """Parent"""
  type Parent {
    type: String
    name: String
  }
  
  """Child"""
  type Child {
    type: String
    name: String
    parent: Parent
    bestFriend: Person
    friends: [Person!]
  }
  
  """Person"""
  union Person = Parent | Child`

  testConversion([parent, child, person], expectedSchemaText)
})
