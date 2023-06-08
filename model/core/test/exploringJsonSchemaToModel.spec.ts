import { expect, test } from 'vitest'
import { Model, NestedModel, Property } from '../src'
import { uuids } from '@cozemble/lang-util'

const customerSchema = {
  title: 'Customer',
  pluralTitle: 'Customers',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      unique: true,
    },
    firstName: {
      type: 'string',
    },
    lastName: {
      type: 'string',
    },
    email: {
      type: 'string',
      format: 'email',
      unique: true,
    },
    phoneNumber: {
      type: 'string',
      unique: true,
    },
    dateOfBirth: {
      type: 'string',
      format: 'date',
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
        },
      },
      required: ['street', 'city', 'state', 'zip'],
    },
  },
  required: ['id', 'firstName', 'lastName', 'email', 'phoneNumber', 'dateOfBirth', 'address'],
}

interface JsonStringProperty extends Property {
  propertyType: { _type: 'property.type'; value: 'json.string.property' }
  jsonType: 'string'
  format?: 'email' | 'date' | 'time'
}

const stringPropertyDescriptor = {
  parseJsonSchemaToSlot(slotName: string, slotSchema: any, required: string[]) {
    if (slotSchema.type !== 'string') {
      throw new Error('invalid slot schema, expected string')
    }
    const slot: JsonStringProperty = {
      _type: 'property',
      id: { _type: 'property.id', value: uuids.v4() },
      name: { _type: 'property.name', value: slotName },
      propertyType: { _type: 'property.type', value: 'json.string.property' },
      jsonType: 'string',
      version: 0,
      required: required.includes(slotName),
      unique: slotSchema.unique ?? false,
    }
    if (slotSchema.format) {
      slot.format = slotSchema.format
    }
    return slot
  },
}

const jsonPropertyDescriptors = {
  string: stringPropertyDescriptor,
}

function convertJsonSchemaToModel(customerSchema: any, modelCollector: Model[]): Model {
  const model: Model = {
    _type: 'model',
    id: { _type: 'model.id', value: uuids.v4() },
    name: { _type: 'model.name', value: customerSchema.title },
    pluralName: {
      _type: 'model.plural.name',
      value: customerSchema.pluralTitle ?? customerSchema.title + 's',
    },
    slots: [],
    nestedModels: [],
  }
  const propertyNames = Object.keys(customerSchema.properties)
  return propertyNames.reduce((model, propertyName) => {
    const propertySchema = customerSchema.properties[propertyName]
    if (propertySchema.type === 'object') {
      const nested = convertJsonSchemaToModel(propertySchema, modelCollector)
      const nestedModel: NestedModel = {
        _type: 'nested.model',
        id: { _type: 'nested.model.id', value: uuids.v4() },
        name: { _type: 'nested.model.name', value: propertyName },
        cardinality: 'one',
        modelId: nested.id,
      }
      modelCollector.push(nested)
      return { ...model, nestedModels: [...model.nestedModels, nestedModel] }
    }
    const descriptor = jsonPropertyDescriptors[propertySchema.type]
    if (!descriptor) {
      return model
    }
    const slot = descriptor.parseJsonSchemaToSlot(
      propertyName,
      propertySchema,
      customerSchema.required,
    )
    return { ...model, slots: [...model.slots, slot] }
  }, model)
}

test('can convert the customer schema to a customer model', () => {
  const modelCollector = [] as Model[]
  const model = convertJsonSchemaToModel(customerSchema, modelCollector)
  expect(model.slots).toHaveLength(6)
  expect(model.nestedModels).toHaveLength(1)
  const addressModel = modelCollector[0]
  expect(addressModel.slots).toHaveLength(4)
})
