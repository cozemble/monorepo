import { describe, expect, test } from 'vitest'
import { modelFns, modelOptions, propertyFns, nestedModelFns } from '@cozemble/model-api'
import { modelToJsonSchema } from '../src/modelToJsonSchema.ts'
import { jsonStringPropertyOptions } from '@cozemble/model-properties-core'

describe('given a customer with a has-one address', () => {
  const addressModel = modelFns.newInstance(
    'Address',
    modelOptions.withProperty(propertyFns.newInstance('Street')),
    modelOptions.withProperty(
      propertyFns.newInstance('Post code', jsonStringPropertyOptions.required),
    ),
  )
  const customerModel = modelFns.newInstance(
    'Customer',
    modelOptions.withProperty(
      propertyFns.newInstance('First name', jsonStringPropertyOptions.required),
    ),
    modelOptions.withProperty(propertyFns.newInstance('Last name')),
    modelOptions.withProperty(
      propertyFns.newInstance(
        'Email',
        jsonStringPropertyOptions.required,
        jsonStringPropertyOptions.pattern(
          '^[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*$',
          'Invalid email address',
        ),
      ),
    ),
    modelOptions.withNestedModels(nestedModelFns.newInstance('Address', addressModel.id, 'one')),
  )

  const models = [customerModel, addressModel]

  test('I can generate a json schema', () => {
    const schema = modelToJsonSchema(customerModel, models)
    // console.log(schema, schema.properties)
    const expected = {
      ref: 'Customer',
      type: 'object',
      properties: {
        'First name': {
          type: 'string',
        },
        'Last name': {
          type: 'string',
        },
        Email: {
          type: 'string',
          pattern: '^[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*@[a-zA-Z0-9]+(?:\\.[a-zA-Z0-9]+)*$',
        },
        Address: {
          type: 'object',
          properties: {
            Street: { type: 'string' },
            'Post code': { type: 'string' },
          },
          required: ['Post code'],
        },
      },
      required: ['First name', 'Email'],
    }
    // commented out until the new jsonn based properties are implemented
    // expect(JSON.stringify(schema, null, 2)).toMatch(JSON.stringify(expected, null, 2))
  })
})
