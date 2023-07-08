import { Property } from './core'
import { PropertyDescriptor } from './propertyDescriptor'
import { TinyValue } from './TinyValue'

export type JsonDataTypes =
  | 'string'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'object'
  | 'array'
  | 'null'

export type JsonDataType = TinyValue<'json.data.type', JsonDataTypes>

export const jsonDataTypes = {
  string: {
    _type: 'json.data.type',
    value: 'string',
  } as JsonDataType,
  integer: {
    _type: 'json.data.type',
    value: 'integer',
  } as JsonDataType,
  number: {
    _type: 'json.data.type',
    value: 'number',
  } as JsonDataType,
  boolean: {
    _type: 'json.data.type',
    value: 'boolean',
  } as JsonDataType,
  object: {
    _type: 'json.data.type',
    value: 'object',
  } as JsonDataType,
  array: {
    _type: 'json.data.type',
    value: 'array',
  } as JsonDataType,
  null: {
    _type: 'json.data.type',
    value: 'null',
  } as JsonDataType,
}

export interface JsonProperty<
  T extends JsonDataType = typeof jsonDataTypes.string,
  V = any,
  C = any,
> extends Property {
  jsonType: T
  configuration: C
}

export function isJsonProperty(obj: any): obj is JsonProperty {
  return obj && typeof obj === 'object' && 'jsonType' in obj && 'configuration' in obj
}

export type JsonSchemaProperty = {
  type?: JsonDataTypes
  title?: string
  description?: string
  enum?: Array<string | number | boolean | null | any>
  properties?: Record<string, JsonSchemaProperty>
  items?: JsonSchemaProperty | JsonSchemaProperty[]
  required?: string[]
  additionalProperties?: boolean | JsonSchemaProperty
  format?: string
  $ref?: string
  oneOf?: JsonSchemaProperty[]
  anyOf?: JsonSchemaProperty[]
  allOf?: JsonSchemaProperty[]
  minimum?: number
  pattern?: string
  contentEncoding?: string
  contentMediaType?: string

  [key: string]: any
}

export type JsonSchema = {
  $schema: string
  $id: string
  type: 'object'
  properties: Record<string, JsonSchemaProperty>
  definitions?: Record<string, JsonSchemaProperty>
  required?: string[]
  additionalProperties?: boolean
  [key: string]: any
}

export const jsonSchemaFns = {
  dropProperty(schema: JsonSchema, propertyName: string): JsonSchema {
    const newSchema = { ...schema }
    delete newSchema.properties[propertyName]
    return newSchema
  },
  requiredPropertiesOnly(schema: JsonSchema): JsonSchema {
    return (schema.required ?? []).reduce(
      (acc, propertyName) => {
        return {
          ...acc,
          properties: { ...acc.properties, [propertyName]: schema.properties[propertyName] },
        }
      },
      { ...schema, properties: {} },
    )
  },
  optionalPropertiesOnly(schema: JsonSchema): JsonSchema {
    return (schema.required ?? []).reduce(
      (acc, propertyName) => {
        delete acc.properties[propertyName]
        return acc
      },
      { ...schema },
    )
  },
}

export interface JsonPropertyDescriptor<T extends JsonProperty, V, C = any>
  extends PropertyDescriptor<T, V> {
  isJsonPropertyDescriptor: true
  jsonType: JsonDataType
  configurationSchema?: JsonSchema | null
  systemConfigurationSchema?: JsonSchema | null
  fixedConfiguration?: C

  augmentConfigurationSchema(schema: JsonSchema): JsonSchema
}

export function isJsonPropertyDescriptor(obj: any): obj is JsonPropertyDescriptor<any, any> {
  return (
    obj &&
    typeof obj === 'object' &&
    'isJsonPropertyDescriptor' in obj &&
    obj.isJsonPropertyDescriptor === true
  )
}

export const jsonPropertyDescriptorFns = {
  withSystemConfigurationSchema<T extends JsonProperty, V, C>(
    descriptor: JsonPropertyDescriptor<T, V, C>,
    systemConfigurationSchema: JsonSchema | null,
  ): JsonPropertyDescriptor<T, V, C> {
    return {
      ...descriptor,
      systemConfigurationSchema,
    }
  },
}
