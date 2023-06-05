import { DottedName, dottedNameFns, ModelId, Property, PropertyId, PropertyName } from './core'
import { SystemConfiguration } from './systemConfiguration'
import { ModelEvent, modelEventFns } from './events'
import { propertyIdFns } from './propertyIdFns'
import ajv from 'ajv'

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
      multiline: {
        type: 'boolean',
        title: 'Are multiple lines permitted',
      },
      regexValidations: {
        type: 'array',
        title: 'Validations based on regular expressions',
        items: {
          type: 'object',
          required: ['regex', 'explainer'],
          properties: {
            regex: {
              type: 'string',
              title: 'The regular expression to validate against',
            },
            explainer: {
              type: 'string',
              title: 'Explain the validation to a user in case it fails',
            },
          },
        },
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
