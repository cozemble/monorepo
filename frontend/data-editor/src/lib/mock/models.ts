import type { JSONSchema } from '$lib/types'

export const invoiceModel: JSONSchema = {
  type: 'object',
  title: 'Invoice',
  properties: {
    invoiceNumber: {
      type: 'string',
      description: 'user name',
    },
    customers: {
      type: 'array',
      items: {
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
          addresses: {
            type: 'array',
            items: {
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
        },
        required: ['firstName', 'email', 'addresses'],
      },
    },
  },
  required: ['invoiceNumber'],
}
