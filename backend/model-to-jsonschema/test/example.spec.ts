import { describe, expect, test } from 'vitest'
import { modelFns, modelOptions, propertyFns, relationshipFns } from '@cozemble/model-api'
import { modelToJsonSchema } from '../src/modelToJsonSchema'
import { stringPropertyOptions } from '@cozemble/model-string-core'

describe.skip('given a customer with a has-one address', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperty(propertyFns.newInstance('Street')),
    modelOptions.withProperty(propertyFns.newInstance('Post code', stringPropertyOptions.required)),
  )
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(
      propertyFns.newInstance('First name', stringPropertyOptions.required),
    ),
    modelOptions.withProperty(propertyFns.newInstance('Last name')),
    modelOptions.withRelationships(relationshipFns.newInstance('Address', addressModel.id, 'one')),
  )
  const models = [customerModel, addressModel]

  test('I can generate a json schema', () => {
    const schema = modelToJsonSchema(customerModel, models)
    const expected = {
      type: 'object',
      properties: {
        'First name': {
          type: 'string',
          description: 'user name',
        },
        'Last name': {
          type: 'string',
        },
        Address: {
          type: 'object',
          properties: {
            Street: {
              type: 'string',
            },
            'Post code': {
              type: 'string',
            },
          },
          required: ['Post code'],
        },
      },
      required: ['First name'],
    }
    expect(schema).toMatch(expected)
  })
})
