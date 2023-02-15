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

export const formulaModel: JSONSchema = {
  type: 'object',
  title: 'Formula',
  properties: {
    dateOfBirth: {
      type: 'string',
      description: 'Date of birth',
    },
    age: {
      type: 'number',
      description: 'Age',
      // json-schema doesn't support formula, so we use a custom property
      formula: (record: any) =>
        record.dateOfBirth
          ? new Date().getFullYear() - new Date(record.dateOfBirth).getFullYear()
          : '',
    },
  },
  required: ['dateOfBirth'],
}
