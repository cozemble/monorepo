import { DottedName, dottedNameFns, ModelId, Property, PropertyId, PropertyName } from './core'
import { SystemConfiguration } from './systemConfiguration'
import { ModelEvent, modelEventFns } from './events'
import { propertyIdFns } from './propertyIdFns'

export type BasicJsonType = 'string' | 'number' | 'boolean' | 'object'
export type TypescriptType = string | number | boolean | any

export interface JsonPropertyInstance<T = BasicJsonType> extends Property {
  propertyType: { _type: 'property.type'; value: 'json.property' }
  jsonType: T
  configurationSchema: string | object
}

export interface JsonSource<P extends JsonPropertyInstance, V = TypescriptType> {
  getRawValue(systemConfiguration: SystemConfiguration, property: P): V | null

  getFormattedValue(systemConfiguration: SystemConfiguration, property: P): V | null
}

export interface JsonSink<P extends JsonPropertyInstance, V = TypescriptType> {
  setValue(systemConfiguration: SystemConfiguration, property: P, value: V | null): JsonSink<P, V>
}

export interface JsonPropertyDescriptor<P extends JsonPropertyInstance, V = TypescriptType> {
  _type: 'json.property.descriptor'
  name: DottedName
  isRequireable: boolean
  isUniqueable: boolean
  newProperty: (
    systemConfiguration: SystemConfiguration,
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ) => ModelEvent

  validateProperty(property: P): Map<string, string>

  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: P,
    value: V | null,
  ) => string[]

  setValue(
    systemConfiguration: SystemConfiguration,
    property: P,
    value: V | null,
    sink: JsonSink<P, V>,
  ): JsonSink<P, V>

  getRawValue(
    systemConfiguration: SystemConfiguration,
    property: P,
    source: JsonSource<P, V>,
  ): V | null

  getFormattedValue(
    systemConfiguration: SystemConfiguration,
    property: P,
    source: JsonSource<P, V>,
  ): V | null
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

export interface StringProperty extends JsonPropertyInstance<'string'> {
  configurationSchema: {
    type: 'object'
    properties: {
      multiline: {
        type: 'boolean'
        title: 'Are multiple lines permitted'
      }
      regexValidations: {
        type: 'array'
        title: 'Validations based on regular expressions'
        items: {
          type: 'object'
          required: ['regex', 'explainer']
          properties: {
            regex: {
              type: 'string'
              title: 'The regular expression to validate against'
            }
            explainer: {
              type: 'string'
              title: 'Explain the validation to a user in case it fails'
            }
          }
        }
      }
    }
  }
}

export const stringPropertyDescriptor: JsonPropertyDescriptor<StringProperty, string> = {
  _type: 'json.property.descriptor',
  name: dottedNameFns.newInstance('String'),
  isRequireable: true,
  isUniqueable: true,
  newProperty: (systemConfiguration, modelId, propertyName, propertyId) => {
    return newJsonPropertyModelEvent(modelId, propertyName, propertyId)
  },
  validateProperty: (property) => {
    return new Map()
  },
  validateValue: (systemConfiguration, property, value) => {
    return []
  },
  setValue: (systemConfiguration, property, value, sink) => {
    return sink
  },
  getRawValue: (systemConfiguration, property, source) => {
    return null
  },
  getFormattedValue: (systemConfiguration, property, source) => {
    return null
  },
}
