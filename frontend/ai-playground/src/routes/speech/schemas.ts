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

export const propertyEssentials: JsonSchema = {
  $schema: 'http://json-schema.org/draft-03/schema#',
  $id: 'property',
  type: 'object',
  title: 'Property',
  pluralTitle: 'Properties',
  required: ['propertyType', 'status', 'address', 'price', 'bedrooms'],
  properties: {
    propertyType: {
      type: 'string',
      enum: [
        'Terraced House',
        'Semi-Detached House',
        'Detached House',
        'Flat',
        'Maisonette',
        'Bungalow',
        'Studio',
      ],
    },
    address: {
      type: 'object',
      properties: {
        buildingNumberOrPropertyName: {
          type: 'string',
        },
        street: {
          type: 'string',
        },
        townOrCity: {
          type: 'string',
        },
        postcode: {
          type: 'string',
        },
      },
      required: ['buildingNumberOrPropertyName', 'street', 'townOrCity', 'postcode'],
    },
    price: {
      type: 'number',
      minimum: 1,
    },
    bedrooms: {
      type: 'integer',
      minimum: 0,
    },
    bathrooms: {
      type: 'integer',
      minimum: 0,
    },
    description: {
      type: 'string',
    },
    parking: {
      type: 'string',
      enum: ['Allocated', 'Garage', 'Driveway', 'On Street', 'Off Street'],
    },
    outsideSpace: {
      type: 'array',
      items: {
        type: 'string',
        enum: ['Garden', 'Patio', 'Balcony', 'Terrace'],
      },
    },
    keyFeatures: {
      type: 'array',
      items: {
        type: 'string',
      },
    },
    floors: {
      type: 'integer',
    },
    condition: {
      type: 'string',
      enum: ['Good', 'Needs Work', 'Major Renovation'],
    },
    heating: {
      type: 'string',
      enum: ['Gas', 'Electric', 'Oil', 'Under Floor'],
    },
    councilTaxBand: {
      type: 'string',
      enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
    },
  },
}
const { model: customerModel, allModels: allCustomerModels } = convertSchemaToModels(customerSchema)
