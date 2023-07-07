import type {
  JsonProperty,
  JsonPropertyDescriptor,
  JsonSchema,
  PropertyType,
} from '@cozemble/model-core'
import {
  type DataRecord,
  dottedNameFns,
  jsonDataTypes,
  modelEventFns,
  type ModelId,
  propertyDescriptors,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
  type SystemConfiguration,
} from '@cozemble/model-core'
import { NewJsonPropertyModelEvent } from '../events'

export const numberPropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/schemas/property/json/number',
  type: 'object',
  properties: {
    decimalPlaces: {
      type: 'number',
      description: 'The number of decimal places this number can have',
    },
    minValue: {
      type: 'number',
    },
    maxValue: {
      type: 'number',
    },
  },
}

export interface NumberPropertyConfiguration {
  _type: 'number.property.configuration'
  decimalPlaces?: number
  minValue?: number
  maxValue?: number
}

const emptyNumberPropertyConfiguration = {}

export type JsonNumberProperty = JsonProperty<
  typeof jsonDataTypes.number,
  number,
  NumberPropertyConfiguration
>

export const numberPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.number.property',
}

export const jsonNumberPropertyDescriptor: JsonPropertyDescriptor<JsonNumberProperty, number> = {
  _type: 'property.descriptor',
  isJsonPropertyDescriptor: true,
  configurationSchema: numberPropertyConfigurationSchema,
  propertyType: numberPropertyType,
  name: dottedNameFns.newInstance('Number'),
  isRequireable: true,
  isUniqueable: true,
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
      propertyType: numberPropertyType,
      jsonType: jsonDataTypes.number,
      propertyId: propertyId ?? propertyIdFns.newInstance(),
      configuration: { ...emptyNumberPropertyConfiguration },
    }
  },

  validateProperty: (property: JsonNumberProperty): Map<string, string> => {
    return new Map<string, string>()
  },

  randomValue: (): number => {
    return Math.random() + 1
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonNumberProperty,
    value: number | null,
  ): string[] => {
    if (property.required) {
      if (value === null || value === undefined) {
        return ['Required']
      }
    }
    if (
      value !== null &&
      property.configuration.minValue &&
      value < property.configuration.minValue
    ) {
      return [`Value must be greater than ${property.configuration.minValue}`]
    }
    if (
      value !== null &&
      property.configuration.maxValue &&
      value > property.configuration.maxValue
    ) {
      return [`Value must be less than ${property.configuration.maxValue}`]
    }

    return []
  },

  setValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonNumberProperty,
    record: DataRecord,
    value: number | null,
  ): DataRecord => {
    record.values[property.id.value] = value
    return record
  },

  getValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonNumberProperty,
    record: DataRecord,
  ): number | null => {
    return record.values[property.id.value] ?? null
  },

  augmentConfigurationSchema: (schema: JsonSchema): JsonSchema => {
    return schema
  },
}

export function registerJsonNumberProperty() {
  propertyDescriptors.register(jsonNumberPropertyDescriptor)
}
