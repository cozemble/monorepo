import type { JsonSchema } from '@cozemble/model-core'
import { convertSchemaToModels } from '$lib/generative/components/helpers'
import { registerEverything } from '@cozemble/model-assembled'

registerEverything()
export const customerSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'customer',
  title: 'Customers',
  pluralTitle: 'Customers',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      unique: true,
    },
    name: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email',
    },
    phone: {
      type: 'string',
      pattern: '^[0-9]{10}$',
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
        zip: {
          type: 'string',
          pattern: '^[0-9]{5}$',
        },
      },
      required: ['street', 'city', 'state', 'zip'],
    },
    dateOfBirth: {
      type: 'string',
      format: 'date',
    },
    gender: {
      type: 'string',
      enum: ['male', 'female', 'other'],
    },
    nationality: {
      type: 'string',
    },
    occupation: {
      type: 'string',
    },
    notes: {
      type: 'string',
    },
  },
  required: ['id', 'name', 'email', 'phone'],
}

const { model: customerModel, allModels: allCustomerModels } = convertSchemaToModels(customerSchema)
