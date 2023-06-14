import type { JsonSchema } from '$lib/types/types'
import type { JsonProperty, PropertyType } from '@cozemble/model-core'
import {
  type DataRecord,
  dottedNameFns,
  jsonDataTypes,
  modelEventFns,
  type ModelId,
  type PropertyDescriptor,
  type PropertyId,
  propertyIdFns,
  type PropertyName,
  type SystemConfiguration,
} from '@cozemble/model-core'
import { propertyDescriptors } from '@cozemble/model-core/dist/esm'
import type { NewJsonPropertyModelEvent } from '$lib/properties/events'
import { propertyConfigurationSchemas } from '$lib/properties/JsonProperty'

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

export type JsonStringProperty = JsonProperty<typeof jsonDataTypes.string, string>

export const jsonStringPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.string.property',
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
      propertyType: jsonStringPropertyType,
      jsonType: jsonDataTypes.string,
      propertyId: propertyId ?? propertyIdFns.newInstance(),
    }
  },

  validateProperty: (property: JsonStringProperty): Map<string, string> => {
    const result = new Map<string, string>()
    if (property.configuration.pattern) {
      try {
        new RegExp(property.configuration.pattern)
      } catch (e) {
        result.set('configuration.pattern', 'Invalid regular expression')
      }
    }

    return result
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
    if (property.configuration.pattern) {
      const regex = new RegExp(property.configuration.pattern)
      if (!regex.test(value ?? '')) {
        return [property.configuration.patternExplanation ?? 'Invalid format']
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

export function registerJsonStringProperty() {
  propertyDescriptors.register(jsonStringPropertyDescriptor)
  propertyConfigurationSchemas.register(jsonStringPropertyType, stringPropertyConfigurationSchema)
}
