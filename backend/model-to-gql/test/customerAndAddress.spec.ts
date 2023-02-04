import { describe, expect, test } from 'vitest'
import { modelFns, modelOptions, propertyFns, relationshipFns } from '@cozemble/model-api'
import { generateGqlSchema } from '../src/generateGqlSchema'

describe.skip('given a customer with a has-one address', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperty(propertyFns.newInstance('Street')),
    modelOptions.withProperty(propertyFns.newInstance('Post code')),
  )
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(propertyFns.newInstance('First name')),
    modelOptions.withProperty(propertyFns.newInstance('Last name')),
    modelOptions.withRelationships(relationshipFns.newInstance('Address', addressModel.id, 'one')),
  )
  const models = [customerModel, addressModel]

  test('I can generate a GraphQL schema', () => {
    const schema = generateGqlSchema(customerModel, models)
    expect(schema).toMatch(`
  type Address {
    id: ID!
    street: String!
    city: String!
    state: String!
    zip: String!
    customerId: ID!
  }

  type Customer {
    id: ID!
    name: String!
    email: String!
    address: Address
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zip: String!
  }

  input CustomerInput {
    name: String!
    email: String!
    address: AddressInput!
  }

  type Query {
    customer(id: ID!): Customer
  }

  type Mutation {
    createCustomer(input: CustomerInput!): Customer
  }
`)
  })
})
