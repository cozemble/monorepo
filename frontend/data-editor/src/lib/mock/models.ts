import DateInput from '$lib/components/inputs/simple/DateInput.svelte'
import ObjectEditorTestCopy from '$lib/components/ObjectEditorTestCopy.svelte'
import DateRangeInput from '$lib/components/tableInputCells/DateRangeInput.svelte'

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
      coz: {
        formula: async (record: any) =>
          record.dateOfBirth
            ? new Date().getFullYear() - new Date(record.dateOfBirth).getFullYear()
            : '',
      },
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
          coz: {
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
      required: ['TRY'],
    },
  },
  required: ['dateOfBirth', 'async'],
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
        timeSlice: {
          type: 'object',
          properties: {
            from: {
              type: 'string',
            },
            to: {
              type: 'string',
            },
          },

          coz: {
            customComponent: DateRangeInput,
            componentDisplay: 'inline',
          },
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
            coz: {
              customComponent: DateInput,
            },
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
            coz: {
              // formula: async (record: any) => {
              //   const item = record.items.find((item: any) => item.item === record.item)
              //   return item ? item.quantity * item.price : 0
              // },
            },
          },
          required: ['item', 'quantity'],
        },
      },
    },
    subtotal: {
      type: 'number',
      coz: {
        formula: async (record: any) => {
          return record.items
            ? record.items.reduce(
                (acc: number, item: any) =>
                  acc +
                  parseFloat(item.quantity) *
                    parseFloat(record.prices.find((p: any) => p.item === item.item).price),
                0,
              )
            : 0
        },
      },
    },
    tenPercentSalesTax: {
      type: 'number',
      coz: {
        formula: async (record: any) => {
          return record.subtotal * 0.1
        },
      },
    },
    total: {
      type: 'number',
      coz: {
        formula: async (record: any) => {
          return record.subtotal + record.tenPercentSalesTax
        },
      },
    },
  },
  required: ['invoiceId'],
}
