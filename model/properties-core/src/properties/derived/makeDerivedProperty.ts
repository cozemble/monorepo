import type {
  JsonDataType,
  JsonProperty,
  JsonPropertyDescriptor,
  JsonSchema,
  ModelId,
  PropertyId,
  PropertyName,
  PropertyType,
  SystemConfiguration,
} from '@cozemble/model-core'
import { dottedNameFns, jsonDataTypes, modelEventFns, propertyIdFns } from '@cozemble/model-core'
import { random } from '@cozemble/lang-util'
import {
  JsonStringProperty,
  jsonStringPropertyDescriptor,
  StringPropertyConfiguration,
  stringPropertyConfigurationSchema,
} from '../string/JsonStringProperty'
import {
  JsonNumberProperty,
  jsonNumberPropertyDescriptor,
  NumberPropertyConfiguration,
  numberPropertyConfigurationSchema,
} from '../number/JsonNumberProperty'
import { NewJsonPropertyModelEvent } from '../events'

export function makeDerivedStringProperty(
  name: string,
  type: string,
  configuration: any,
  exampleProvider: string[] | ((systemConfiguration: SystemConfiguration) => string),
  configurationSchema: JsonSchema | null = stringPropertyConfigurationSchema,
): JsonPropertyDescriptor<JsonStringProperty, string, StringPropertyConfiguration> {
  return {
    ...makeDerivedProperty(
      name,
      type,
      configuration,
      exampleProvider,
      jsonStringPropertyDescriptor,
      jsonDataTypes.string,
    ),
    configurationSchema,
  }
}

export function makeDerivedNumberProperty(
  name: string,
  type: string,
  configuration: any,
  exampleProvider: number[] | ((systemConfiguration: SystemConfiguration) => number),
  configurationSchema: JsonSchema | null = numberPropertyConfigurationSchema,
): JsonPropertyDescriptor<JsonNumberProperty, number, NumberPropertyConfiguration> {
  return {
    ...makeDerivedProperty<JsonNumberProperty, number, NumberPropertyConfiguration>(
      name,
      type,
      configuration,
      exampleProvider,
      jsonNumberPropertyDescriptor,
      jsonDataTypes.number,
    ),
    configurationSchema,
  }
}

function makeDerivedProperty<T extends JsonProperty, V, C>(
  name: string,
  type: string,
  configuration: any,
  exampleProvider: V[] | ((systemConfiguration: SystemConfiguration) => V),
  baseType: JsonPropertyDescriptor<T, V>,
  jsonType: JsonDataType,
): JsonPropertyDescriptor<T, V, C> {
  const thisPropertyType: PropertyType = {
    _type: 'property.type',
    value: type,
  }

  return {
    ...baseType,
    propertyType: thisPropertyType,
    name: dottedNameFns.newInstance(name),
    randomValue: (systemConfiguration: SystemConfiguration): V => {
      if (typeof exampleProvider === 'function') {
        return exampleProvider(systemConfiguration)
      }
      return random.elementOfArray(exampleProvider)
    },
    newProperty: (
      systemConfiguration: SystemConfiguration,
      modelId: ModelId,
      propertyName: PropertyName,
      propertyId?: PropertyId,
    ): NewJsonPropertyModelEvent => {
      return {
        _type: 'new.json.property.model.event',
        ...modelEventFns.coreParts(modelId),
        propertyName,
        propertyType: thisPropertyType,
        jsonType,
        propertyId: propertyId ?? propertyIdFns.newInstance(),
        configuration: configuration,
      }
    },
  }
}
