import DateInput from '$lib/components/inputs/simple/DateInput.svelte'
import ObjectEditorTestCopy from '$lib/components/ObjectEditorTestCopy.svelte'

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
        title: 'Customer',
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
              title: 'Address',
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
      required: ['TRY'],
    },
  },
  required: ['dateOfBirth', 'async'],

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
    now: {
      type: 'object',
      properties: {
        date: {
          type: 'string',
          description: 'Date',
        },
        time: {
          type: 'string',
          description: 'Time',
        },

        coz: {
          overrides: {
            // override the default component for all string fields
            components: {
              string: DateInput,
            },
          },
        },
      },
    },
    dudes: {
      type: 'array',
      items: {
        type: 'object',
        title: 'Dude',
        properties: {
          firstName: {
            type: 'string',
          },
          lastName: {
            type: 'string',
          },
          dateOfBirth: {
            type: 'string',
          },
          address: {
            type: 'object',
            title: 'Address',
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
            coz: {
              overrides: {
                components: {
                  string: null,
                },
              },
            },
          },
          family: {
            type: 'object',
            title: 'Family',
            properties: {
              wife: {
                type: 'object',
                title: 'Wife',
                properties: {
                  firstName: {
                    type: 'string',
                  },
                  lastName: {
                    type: 'string',
                  },
                },
              },
              kids: {
                type: 'array',
                items: {
                  type: 'object',
                  title: 'Kid',
                  properties: {
                    firstName: {
                      type: 'string',
                    },
                    lastName: {
                      type: 'string',
                    },
                  },
                },
              },
            },
            coz: {
              overrides: {
                components: {
                  object: ObjectEditorTestCopy,
                },
              },
            },
          },
        },
        required: ['firstName', 'dateOfBirth'],

        coz: {
          overrides: {
            components: {
              string: DateInput,
            },
          },
        },
      },
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

export const fruitererModel: JSONSchema = {
  type: 'object',
  properties: {
    invoiceId: {
      type: 'string',
      description: 'user name',
    },
    prices: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
          },
          price: {
            type: 'number',
          },
        },
        required: ['item', 'price'],
      },
    },
    items: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          item: {
            type: 'string',
          },
          quantity: {
            type: 'number',
          },
          total: {
            type: 'number',
          },
        },
        required: ['item', 'quantity'],
      },
    },
    subtotal: {
      type: 'number',
    },
    tenPercentSalesTax: {
      type: 'number',
    },
    total: {
      type: 'number',
    },
  },
  required: ['invoiceId'],

  coz: {
    properties: {
      // items: {
      //   properties: {
      //     total: {
      //       formula: async (record: any) => {
      //         const item = record.items.find((item: any) => item.item === record.item)
      //         return item ? item.quantity * item.price : 0
      //       }

      // },
      subtotal: {
        formula: async (record: any) => {
          return record.items
            ? record.items.reduce(
                (acc: number, item: any) =>
                  acc +
                  parseFloat(item.quantity) *
                    parseFloat(record.prices.find((p) => p.item === item.item).price),
                0,
              )
            : 0
        },
      },

      tenPercentSalesTax: {
        formula: async (record: any) => {
          return record.subtotal * 0.1
        },
      },

      total: {
        formula: async (record: any) => {
          return record.subtotal + record.tenPercentSalesTax
        },
      },
    },
  },
}
