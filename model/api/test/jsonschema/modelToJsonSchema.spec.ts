import { expect, test } from 'vitest'
import { modelFns, modelOptions, nestedModelFns, propertyFns } from '../../src'
import { Model, ModelId, Property } from '@cozemble/model-core'

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
  referencedModelId: ModelId
}

export type JsonTypeConfiguration =
  | StringTypeConfiguration
  | IntegerTypeConfiguration
  | NumberTypeConfiguration
  | BooleanTypeConfiguration
  | ObjectTypeConfiguration

export interface JsonProperty<T = JsonType, C = JsonTypeConfiguration> extends Property {
  propertyType: { _type: 'property.type'; value: 'json.property' }
  title?: string
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
  integer: (
    name: string,
    configuration: Partial<IntegerTypeConfiguration> = {},
  ): JsonProperty<'integer', IntegerTypeConfiguration> => {
    return {
      ...propertyFns.newInstance(name),
      propertyType: { _type: 'property.type', value: 'json.property' },
      jsonType: 'integer',
      configuration: { _type: 'integer.type.configuration', ...configuration },
    }
  },
  number: (
    name: string,
    configuration: Partial<NumberTypeConfiguration> = {},
  ): JsonProperty<'number', NumberTypeConfiguration> => {
    return {
      ...propertyFns.newInstance(name),
      propertyType: { _type: 'property.type', value: 'json.property' },
      jsonType: 'number',
      configuration: { _type: 'number.type.configuration', ...configuration },
    }
  },
  boolean: (
    name: string,
    configuration: Partial<BooleanTypeConfiguration> = {},
  ): JsonProperty<'boolean', BooleanTypeConfiguration> => {
    return {
      ...propertyFns.newInstance(name),
      propertyType: { _type: 'property.type', value: 'json.property' },
      jsonType: 'boolean',
      configuration: { _type: 'boolean.type.configuration', ...configuration },
    }
  },
  object: (
    name: string,
    referencedModelId: ModelId,
    configuration: Partial<ObjectTypeConfiguration> = {},
  ): JsonProperty<'object', ObjectTypeConfiguration> => {
    return {
      ...propertyFns.newInstance(name),
      propertyType: { _type: 'property.type', value: 'json.property' },
      jsonType: 'object',
      configuration: { _type: 'object.type.configuration', referencedModelId, ...configuration },
    }
  },
}

function applyStringConfiguration(properties: any, config: StringTypeConfiguration): any {
  if (config.format) {
    properties.format = config.format
  }
  if (config.pattern) {
    properties.pattern = config.pattern
  }
  return properties
}

function writeSlotsToProperties(model) {
  return model.slots.reduce((properties, slot) => {
    if (slot._type === 'property' && slot.propertyType.value === 'json.property') {
      const jsonSlot = slot as JsonProperty
      let config: any = {
        type: jsonSlot.jsonType,
      }
      if (jsonSlot.unique) {
        config.unique = true
      }
      if (jsonSlot.title) {
        config.title = jsonSlot.title
      }
      if (jsonSlot.configuration._type === 'string.type.configuration') {
        config = applyStringConfiguration(config, jsonSlot.configuration)
      }
      properties[jsonSlot.name.value] = config
    }
    return properties
  }, {})
}

function writeNestedModelsToProperties(models: Model[], model: Model) {
  return model.nestedModels.reduce((properties, nestedModel) => {
    const referencedModel = modelFns.findById(models, nestedModel.modelId)
    return { ...properties, [nestedModel.name.value]: modelToJsonSchema(models, referencedModel) }
  }, {})
}

function modelToJsonSchema(models: Model[], model: Model) {
  const properties = writeSlotsToProperties(model)
  const nestedProperties = writeNestedModelsToProperties(models, model)
  return {
    title: model.name.value,
    type: 'object',
    properties: { ...properties, ...nestedProperties },
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
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(expect.objectContaining({ email: { type: 'string' } }))
})

test('can write title for a property', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty({
      ...jsonPropertyFns.string('email'),
      title: 'A valid email address',
    } as JsonProperty),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(
    expect.objectContaining({ email: { type: 'string', title: 'A valid email address' } }),
  )
})

test('by default a property is optional', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.string('email')),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.required).toEqual([])
})

test('can write a format to a string property', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.string('email', { format: 'email' })),
  )
  const jsonSchema = modelToJsonSchema([model], model)
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
  const jsonSchema = modelToJsonSchema([model], model)
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
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.required).toEqual(['email'])
})

test('can mark a property as unique', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty({ ...jsonPropertyFns.string('email'), unique: true }),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(
    expect.objectContaining({
      email: {
        type: 'string',
        unique: true,
      },
    }),
  )
})

test('can write an integer property to json schema', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.integer('age')),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(expect.objectContaining({ age: { type: 'integer' } }))
})

test('can write an number property to json schema', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.number('age')),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(expect.objectContaining({ age: { type: 'number' } }))
})

test('can write an boolean property to json schema', () => {
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withProperty(jsonPropertyFns.boolean('age')),
  )
  const jsonSchema = modelToJsonSchema([model], model)
  expect(jsonSchema.properties).toEqual(expect.objectContaining({ age: { type: 'boolean' } }))
})

test('can write a property nested in an object to json schema', () => {
  const innerModel = modelFns.newInstance(
    'Inner',
    modelOptions.withProperty(jsonPropertyFns.string('email')),
  )
  const model = modelFns.newInstance(
    'Model',
    modelOptions.withNestedModels(nestedModelFns.newInstance('inner', innerModel.id, 'one')),
  )
  const jsonSchema = modelToJsonSchema([innerModel, model], model)
  expect(jsonSchema.properties).toEqual(
    expect.objectContaining({
      inner: {
        type: 'object',
        title: 'Inner',
        required: [],
        properties: { email: { type: 'string' } },
      },
    }),
  )
})
