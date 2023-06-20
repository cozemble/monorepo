import type {
  JsonSchema,
  JsonSchemaProperty,
  Model,
  ModelId,
  ModelSlot,
  NestedModel,
  Property,
} from '@cozemble/model-core'
import { strings } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'

function basicJsonProperty(property: Property): JsonSchemaProperty {
  const propertyType = property.propertyType
  switch (propertyType.value) {
    case 'json.string.property':
      return { type: 'string' }
    case 'json.number.property':
      return { type: 'number' }
    case 'json.integer.property':
      return { type: 'integer' }
    case 'json.boolean.property':
      return { type: 'boolean' }
    case 'json.date.property':
      return { type: 'string', format: 'date' }
    case 'json.time.property':
      return { type: 'string', format: 'time' }
    case 'json.phoneNumber.property':
      return { type: 'string', format: 'phone' }
    case 'json.email.property':
      return { type: 'string', format: 'email' }
    default:
      throw new Error(`Unknown property type: ${propertyType.value}`)
  }
}

function propertyToJsonDataType(property: Property): JsonSchemaProperty {
  const jsonProperty = basicJsonProperty(property)
  if (property.unique) {
    jsonProperty.unique = true
  }
  return jsonProperty
}

function toJsonProperty(slot: ModelSlot): { key: string; property: JsonSchemaProperty } {
  if (slot._type === 'property') {
    return {
      key: strings.camelize(slot.name.value),
      property: propertyToJsonDataType(slot as Property),
    }
  }
  throw new Error(`Unknown slot type: ${slot._type}`)
}

function toNestedJsonProperty(
  allModels: Model[],
  nested: NestedModel,
): { key: string; property: JsonSchemaProperty } {
  const nestedModel = modelFns.findById(allModels, nested.modelId)
  const { properties, required } = propertiesForModel(nestedModel, allModels)
  if (nested.cardinality === 'one') {
    return {
      key: strings.camelize(nestedModel.name.value),
      property: {
        type: 'object',
        properties,
        required,
      },
    }
  } else {
    return {
      key: strings.camelize(nestedModel.pluralName.value),
      property: {
        type: 'array',
        items: {
          type: 'object',
          properties,
          required,
        },
      },
    }
  }
}

function propertiesForModel(
  model: Model,
  allModels: Model[],
): { properties: Record<string, JsonSchemaProperty>; required: string[] } {
  const properties = [
    ...model.slots.map((slot) => toJsonProperty(slot)),
    ...model.nestedModels.map((nested) => toNestedJsonProperty(allModels, nested)),
  ].reduce((acc, property) => {
    acc[property.key] = property.property
    return acc
  }, {} as Record<string, JsonSchemaProperty>)
  const required = model.slots
    .filter((slot) => slot._type === 'property' && slot.required)
    .map((slot) => strings.camelize(slot.name.value))
  return { properties, required }
}

export function convertModelToJsonSchema(model: Model, allModels: Model[]): JsonSchema {
  const { properties, required } = propertiesForModel(model, allModels)
  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: model.name.value,
    pluralTitle: model.pluralName.value,
    $id: model.id.value,
    type: 'object',
    properties,
    required,
  }
}
