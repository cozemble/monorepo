import type {
  DataRecord,
  ModelEvent,
  ModelId,
  Property,
  PropertyDescriptor,
  PropertyId,
  PropertyName,
  PropertyType,
  SystemConfiguration,
} from '@cozemble/model-core'
import {
  dottedNameFns,
  modelEventFns,
  propertyDescriptors,
  propertyIdFns,
} from '@cozemble/model-core'
import { propertyFns } from '@cozemble/model-api'
import type { JsonSchema } from '$lib/types/types'

export type JsonDataType = 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null'

const stringPropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/schemas/property/json/string',
  type: 'object',
  properties: {
    pattern: {
      type: 'string',
    },
    patternExplanation: {
      type: 'string',
    },
    multipleLines: {
      type: 'boolean',
      description: 'Whether the text can have multiple lines',
    },
    prefix: {
      type: 'string',
    },
    suffix: {
      type: 'string',
    },
  },
}

export interface JsonProperty<T extends JsonDataType = 'string', V = any> extends Property {
  jsonType: T
  configuration: any
}

export const propertyConfigurationSchemaMap = new Map<string, JsonSchema>()

export const propertyConfigurationSchemas = {
  register(propertyType: PropertyType, schema: JsonSchema) {
    propertyConfigurationSchemaMap.set(propertyType.value, schema)
  },
  get(propertyType: PropertyType): JsonSchema | null {
    return propertyConfigurationSchemaMap.get(propertyType.value) ?? null
  },
}

export const jsonStringPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.string.property',
}

export type JsonStringProperty = JsonProperty<'string', string>

export const jsonProperty = {
  string(name: string): JsonStringProperty {
    return {
      ...propertyFns.newInstance(name),
      jsonType: 'string',
      propertyType: jsonStringPropertyType,
      configuration: { pattern: '' },
    }
  },
}

export interface NewJsonPropertyModelEvent extends ModelEvent {
  _type: 'new.json.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
  jsonType: JsonDataType
}

export const jsonStringPropertyDescriptor: PropertyDescriptor<JsonStringProperty, string> = {
  _type: 'property.descriptor',
  propertyType: jsonStringPropertyType,
  name: dottedNameFns.newInstance('String'),
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
      jsonType: 'string',
      propertyId: propertyId ?? propertyIdFns.newInstance(),
    }
  },

  validateProperty: (property: JsonStringProperty): Map<string, string> => {
    return new Map()
  },

  randomValue: (): string => {
    return (Math.random() + 1).toString(36).substring(2)
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonStringProperty,
    value: string | null,
  ): string[] => {
    if (property.required) {
      if (value === null || value === undefined || value === '') {
        return ['Required']
      }
    }
    return []
  },

  setValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonStringProperty,
    record: DataRecord,
    value: string | null,
  ): DataRecord => {
    record.values[property.id.value] = value
    return record
  },

  getValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonStringProperty,
    record: DataRecord,
  ): string | null => {
    return record.values[property.id.value] ?? null
  },
}

export function registerJsonProperties() {
  propertyDescriptors.register(jsonStringPropertyDescriptor)
  propertyConfigurationSchemas.register(jsonStringPropertyType, stringPropertyConfigurationSchema)
}
