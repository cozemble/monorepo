import type {
  DataRecord,
  JsonDataType,
  JsonProperty,
  Model,
  ModelEvent,
  ModelEventDescriptor,
  ModelId,
  PropertyDescriptor,
  PropertyId,
  PropertyName,
  PropertyType,
  SystemConfiguration,
} from '@cozemble/model-core'
import {
  dottedNameFns,
  jsonDataTypes,
  modelEventDescriptors,
  modelEventFns,
  propertyDescriptors,
  propertyIdFns,
  propertyNameFns,
} from '@cozemble/model-core'
import { propertyFns } from '@cozemble/model-api'
import type { JsonSchema } from '$lib/types/types'

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

export const jsonPhoneNumberPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.phoneNumber.property',
}

export type JsonStringProperty = JsonProperty<typeof jsonDataTypes.string, string>

export const jsonProperty = {
  string(name: string): JsonStringProperty {
    return {
      ...propertyFns.newInstance(name),
      jsonType: jsonDataTypes.string,
      propertyType: jsonStringPropertyType,
      configuration: { pattern: '' },
    }
  },
  phoneNumber(name: string): JsonStringProperty {
    return {
      ...propertyFns.newInstance(name),
      jsonType: jsonDataTypes.string,
      propertyType: jsonPhoneNumberPropertyType,
      configuration: phoneNumberConfiguration,
    }
  },
}

export interface NewJsonPropertyModelEvent extends ModelEvent {
  _type: 'new.json.property.model.event'
  propertyName: PropertyName
  propertyId: PropertyId
  jsonType: JsonDataType
  propertyType: PropertyType
  configuration?: any
}

export function emptyProperty(name: string): JsonProperty {
  const id = propertyIdFns.newInstance()
  return {
    _type: 'property',
    propertyType: jsonStringPropertyType,
    jsonType: jsonDataTypes.string,
    id,
    version: 1,
    name: propertyNameFns.newInstance(name),
    required: false,
    unique: false,
    configuration: {},
  }
}

export const newJsonPropertyModelEventDescriptor: ModelEventDescriptor = {
  _type: 'model.event.descriptor',
  modelEventType: 'new.json.property.model.event',
  applyEvent: (model: Model, event: NewJsonPropertyModelEvent): Model => {
    let newProperty = {
      ...emptyProperty(`Property`),
      id: event.propertyId,
      name: event.propertyName,
      configuration: event.configuration ?? {},
      propertyType: event.propertyType,
      jsonType: event.jsonType,
    }
    if (model.slots.some((p) => p.id.value === event.propertyId.value)) {
      newProperty = { ...newProperty, id: event.propertyId }
      return {
        ...model,
        slots: model.slots.map((p) => (p.id.value === event.propertyId.value ? newProperty : p)),
      }
    }
    return { ...model, slots: [...model.slots, newProperty] }
  },
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

const phoneNumberConfiguration = {
  pattern: '^\\+?[\\d\\s\\-\\(\\)]{7,20}$',
  patternExplanation: 'Must be a valid phone number',
  multipleLines: false,
  prefix: '',
  suffix: '',
}

export const phoneNumberPropertyDescriptor: PropertyDescriptor<JsonStringProperty, string> = {
  ...jsonStringPropertyDescriptor,
  propertyType: jsonPhoneNumberPropertyType,
  name: dottedNameFns.newInstance('Phone number'),
  randomValue: (): string => {
    return '0412345678'
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
      propertyType: jsonPhoneNumberPropertyType,
      jsonType: jsonDataTypes.string,
      propertyId: propertyId ?? propertyIdFns.newInstance(),
      configuration: phoneNumberConfiguration,
    }
  },
}

export function registerJsonProperties() {
  propertyDescriptors.register(jsonStringPropertyDescriptor)
  propertyDescriptors.register(phoneNumberPropertyDescriptor)
  propertyConfigurationSchemas.register(jsonStringPropertyType, stringPropertyConfigurationSchema)
  modelEventDescriptors.register(newJsonPropertyModelEventDescriptor)
}
