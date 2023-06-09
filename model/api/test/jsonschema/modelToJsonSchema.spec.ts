import { expect, test } from 'vitest'
import { modelFns, modelOptions, propertyFns } from '../../src'
import { Model, Property } from '@cozemble/model-core'

export type JsonType = 'string' | 'integer' | 'number' | 'boolean' | 'object'

export interface StringTypeConfiguration {
  _type: 'string.type.configuration'
  format?: 'email' | 'date' | 'time'
  pattern?: string
}

export interface IntegerTypeConfiguration {
  _type: 'integer.type.configuration'
}

export interface NumberTypeConfiguration {
  _type: 'number.type.configuration'
}

export interface BooleanTypeConfiguration {
  _type: 'boolean.type.configuration'
}

export interface ObjectTypeConfiguration {
  _type: 'object.type.configuration'
}

export type JsonTypeConfiguration =
  | StringTypeConfiguration
  | IntegerTypeConfiguration
  | NumberTypeConfiguration
  | BooleanTypeConfiguration
  | ObjectTypeConfiguration

export interface JsonProperty<T = JsonType, C = JsonTypeConfiguration> extends Property {
  propertyType: { _type: 'property.type'; value: 'json.property' }
  jsonType: T
  configuration: C
}

export const jsonPropertyFns = {
  string: (
    name: string,
    configuration: Partial<StringTypeConfiguration> = {},
  ): JsonProperty<'string', StringTypeConfiguration> => {
    return {
      ...propertyFns.newInstance(name),
      propertyType: { _type: 'property.type', value: 'json.property' },
      jsonType: 'string',
      configuration: { _type: 'string.type.configuration', ...configuration },
    }
  },
}

function modelToJsonSchema(model: Model) {
  return {
    title: model.name.value,
    type: 'object',
    properties: model.slots.reduce((properties, slot) => {
      if (slot._type === 'property' && slot.propertyType.value === 'json.property') {
        const jsonSlot = slot as JsonProperty
        const configuration = jsonSlot.configuration as StringTypeConfiguration
        properties[jsonSlot.name.value] = {
          type: jsonSlot.jsonType,
        }
        if (configuration.format) {
          properties[jsonSlot.name.value].format = configuration.format
        }
        if (configuration.pattern) {
          properties[jsonSlot.name.value].pattern = configuration.pattern
        }
      }
      return properties
    }, {}),
    required: model.slots.reduce((required, slot) => {
      if (slot._type === 'property' && slot.required) {
        return [...required, slot.name.value]
      }
      return required
    }, []),
  }
}

test('can write a model with a single string property to json schema', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.string('email')),
  )
  const jsonSchema = modelToJsonSchema(model)
  expect(jsonSchema.properties).toEqual(expect.objectContaining({ email: { type: 'string' } }))
})

test('by default a property is optional', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.string('email')),
  )
  const jsonSchema = modelToJsonSchema(model)
  expect(jsonSchema.required).toEqual([])
})

test('can write a format to a string property', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.string('email', { format: 'email' })),
  )
  const jsonSchema = modelToJsonSchema(model)
  expect(jsonSchema.properties).toEqual(
    expect.objectContaining({ email: { type: 'string', format: 'email' } }),
  )
})

test('can write a pattern to a string property', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(
      jsonPropertyFns.string('email', {
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      }),
    ),
  )
  const jsonSchema = modelToJsonSchema(model)
  expect(jsonSchema.properties).toEqual(
    expect.objectContaining({
      email: {
        type: 'string',
        pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
      },
    }),
  )
})

test('can mark a property as required', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty({ ...jsonPropertyFns.string('email'), required: true }),
  )
  const jsonSchema = modelToJsonSchema(model)
  expect(jsonSchema.required).toEqual(['email'])
})
