import { DottedName, dottedNameFns, ModelId, Property, PropertyId, PropertyName } from './core'
import { SystemConfiguration } from './systemConfiguration'
import { ModelEvent, modelEventFns } from './events'
import { propertyIdFns } from './propertyIdFns'
import ajv from 'ajv'
import { TinyValue } from './TinyValue'

export type JsonDataType = TinyValue<
  'json.data.type',
  'string' | 'integer' | 'number' | 'boolean' | 'object' | 'array' | 'null'
>

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

export interface JsonProperty<T extends JsonDataType = typeof jsonDataTypes.string, V = any>
  extends Property {
  jsonType: T
  configuration: any
}

export function isJsonProperty(obj: any): obj is JsonProperty {
  return obj && typeof obj === 'object' && 'jsonType' in obj && 'configuration' in obj
}

export type BasicJsonType = 'string' | 'integer' | 'number' | 'boolean' | 'object'
export type TypescriptType = string | number | boolean | any

export interface JsonPropertyInstance<T = BasicJsonType> extends Property {
  propertyType: { _type: 'property.type'; value: 'json.property' }
  jsonType: T
  configuration: object
}

// export interface JsonSource<P extends JsonPropertyInstance, V = TypescriptType> {
//   getRawValue(systemConfiguration: SystemConfiguration, property: P): V | null
//
//   getFormattedValue(systemConfiguration: SystemConfiguration, property: P): V | null
// }
//
// export interface JsonSink<P extends JsonPropertyInstance, V = TypescriptType> {
//   setValue(systemConfiguration: SystemConfiguration, property: P, value: V | null): JsonSink<P, V>
// }

export interface JsonPropertyDescriptor<P extends JsonPropertyInstance, V = TypescriptType> {
  _type: 'json.property.descriptor'
  name: DottedName
  isRequireable: boolean
  isUniqueable: boolean
  configurationSchema: object
  newProperty: (
    systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => ModelEvent

  validateProperty(descriptor: JsonPropertyDescriptor<P>, property: P): Map<string, string>

  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: P,
    value: V | null,
  ) => string[]

  // setValue(
  //   systemConfiguration: SystemConfiguration,
  //   property: P,
  //   value: V | null,
  //   sink: JsonSink<P, V>,
  // ): JsonSink<P, V>
  //
  // getRawValue(
  //   systemConfiguration: SystemConfiguration,
  //   property: P,
  //   source: JsonSource<P, V>,
  // ): V | null
  //
  // getFormattedValue(
  //   systemConfiguration: SystemConfiguration,
  //   property: P,
  //   source: JsonSource<P, V>,
  // ): V | null
}

export interface NewJsonPropertyModelEvent extends ModelEvent {
  _type: 'new.json.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
}

export function newJsonPropertyModelEvent(
  modelId: ModelId,
  propertyName: PropertyName,
  propertyId?: PropertyId,
): NewJsonPropertyModelEvent {
  return {
    _type: 'new.json.property.model.event',
    ...modelEventFns.coreParts(modelId),
    propertyName,
    propertyId: propertyId ?? propertyIdFns.newInstance(),
  }
}

export type StringProperty = JsonPropertyInstance<'string'>

export const stringPropertyDescriptor: JsonPropertyDescriptor<StringProperty, string> = {
  _type: 'json.property.descriptor',
  name: dottedNameFns.newInstance('String'),
  isRequireable: true,
  isUniqueable: true,
  configurationSchema: {
    type: 'object',
    properties: {
      title: {
        title: 'Explain what this property is for',
        type: 'string',
      },
      multiline: {
        title: 'Whether to allow multiple lines of text',
        type: 'boolean',
      },
      pattern: {
        title: 'A regular expression to validate against',
        type: 'string',
      },
    },
  },
  newProperty: (systemConfiguration, modelId, propertyName, propertyId) => {
    return newJsonPropertyModelEvent(modelId, propertyName, propertyId)
  },
  validateProperty: (descriptor, property) => {
    const v = new ajv()
    const validate = v.compile(descriptor.configurationSchema)
    const valid = validate(property.configuration)
    console.log({ valid })
    if (!valid) {
      console.log(validate.errors)
    }
    return new Map()
  },
  validateValue: (systemConfiguration, property, value) => {
    return []
  },
}

/**
 * Why do I need a config schema at all?  If its a string, then it can be configured using standard string json schema constraints.
 * Same for integer, decimal, boolean
 */
