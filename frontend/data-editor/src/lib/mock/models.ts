import DateInput from '$lib/components/inputs/simple/DateInput.svelte'

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
      minItems: 2,
      maxItems: 4,
      uniqueItems: true,
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
    },
    async: {
      type: 'object',
      description: 'Async',
      properties: {
        TRY: {
          type: 'number',
          description: 'TRY',
        },
        USD: {
          type: 'number',
          description: 'USD',
        },
      },
    },
  },
  required: ['dateOfBirth'],

  // Cozemble specific configurations
  coz: {
    properties: {
      age: {
        // json-schema doesn't support formula, so we use a custom property
        formula: async (record: any) =>
          record.dateOfBirth
            ? new Date().getFullYear() - new Date(record.dateOfBirth).getFullYear()
            : '',
      },
      async: {
        properties: {
          USD: {
            formula: async (record: any) => {
              // wait for 3 seconds to simulate network latency
              await new Promise((resolve) => setTimeout(resolve, 3000))
              const response = await fetch('https://api.exchangerate.host/latest?base=TRY')
              const data = await response.json()
              return record.async.TRY * data.rates.USD
            },
          },
        },
      },
    },
  },
}

export const customComponentModel: JSONSchema = {
  type: 'object',
  title: 'Custom Component',
  properties: {
    dateOfBirth: {
      type: 'string',
      description: 'Date of birth',
    },
  },
  required: ['dateOfBirth'],

  coz: {
    properties: {
      dateOfBirth: {
        customComponent: DateInput,
      },
    },
  },
}
