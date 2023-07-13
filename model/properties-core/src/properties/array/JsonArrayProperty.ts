import {
  DataRecord,
  dottedNameFns,
  jsonDataTypes,
  JsonProperty,
  JsonPropertyDescriptor,
  JsonSchema,
  modelEventFns,
  ModelId,
  propertyDescriptors,
  PropertyId,
  propertyIdFns,
  PropertyName,
  PropertyType,
  SystemConfiguration,
} from '@cozemble/model-core'
import { NewJsonPropertyModelEvent } from '../events.js'
import { JsonDataType } from '@cozemble/model-core/dist/esm'

export const arrayPropertyConfigurationSchema: JsonSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  $id: 'https://cozemble.com/schemas/property/json/array',
  type: 'object',
  properties: {
    itemType: {
      type: 'string',
      description: 'What type of item is allowed in the list',
    },
    minItems: {
      type: 'integer',
    },
    maxItems: {
      type: 'integer',
    },
  },
  required: ['itemType'],
}

export interface ArrayPropertyConfiguration {
  _type: 'array.property.configuration'
  itemType: string
  minItems?: number
  maxItems?: number
}

export type JsonArrayProperty = JsonProperty<
  typeof jsonDataTypes.array,
  any[],
  ArrayPropertyConfiguration
>

export const arrayPropertyType: PropertyType = {
  _type: 'property.type',
  value: 'json.array.property',
}

export interface JsonArrayPropertyDescriptorExtensions {
  emptyArrayItem(type: JsonDataType): any
}

export const jsonArrayPropertyDescriptor: JsonPropertyDescriptor<JsonArrayProperty, any[]> &
  JsonArrayPropertyDescriptorExtensions = {
  _type: 'property.descriptor',
  isJsonPropertyDescriptor: true,
  jsonType: jsonDataTypes.array,
  configurationSchema: arrayPropertyConfigurationSchema,
  propertyType: arrayPropertyType,
  name: dottedNameFns.newInstance('List of...'),
  isRequireable: false,
  isUniqueable: false,
  newProperty: (
    modelId: ModelId,
    propertyName: PropertyName,
    propertyId?: PropertyId,
  ): NewJsonPropertyModelEvent => {
    return {
      _type: 'new.json.property.model.event',
      ...modelEventFns.coreParts(modelId),
      propertyName,
      propertyType: arrayPropertyType,
      jsonType: jsonDataTypes.array,
      propertyId: propertyId ?? propertyIdFns.newInstance(),
    }
  },

  validateProperty: (property: JsonArrayProperty): Map<string, string> => {
    const result = new Map<string, string>()
    if (!property.configuration.itemType) {
      result.set('itemType', 'Must specify an item type')
    }
    return result
  },

  randomValue: (): any[] => {
    return []
  },
  validateValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonArrayProperty,
    value: any[] | null,
  ): string[] => {
    if (
      property.configuration.minItems &&
      value &&
      value.length < property.configuration.minItems
    ) {
      return [`Must have at least ${property.configuration.minItems} items`]
    }
    if (
      property.configuration.maxItems &&
      value &&
      value.length > property.configuration.maxItems
    ) {
      return [`Must have no more than ${property.configuration.maxItems} items`]
    }
    return []
  },

  setValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonArrayProperty,
    record: DataRecord,
    value: any[] | null,
  ): DataRecord => {
    record.values[property.id.value] = value
    return record
  },

  getValue: (
    systemConfiguration: SystemConfiguration,
    property: JsonArrayProperty,
    record: DataRecord,
  ): any[] | null => {
    return record.values[property.id.value] ?? null
  },

  augmentConfigurationSchema: (schema: JsonSchema): JsonSchema => {
    if (schema.properties.itemType) {
      const options = propertyDescriptors
        .list()
        .filter((pd: any) => pd !== jsonArrayPropertyDescriptor)
        .map((descriptor: any) => ({ id: descriptor.propertyType.value, name: descriptor.name.value }))
      return {
        ...schema,
        properties: {
          ...schema.properties,
          itemType: { ...schema.properties.itemType, enum: options },
        },
      }
    }
    return schema
  },

  emptyArrayItem: (type: JsonDataType): any => {
    if (type === jsonDataTypes.string) {
      return ''
    }
    if (type === jsonDataTypes.number) {
      return 0
    }
    if (type === jsonDataTypes.boolean) {
      return false
    }
    if (type === jsonDataTypes.array) {
      return []
    }
    throw new Error(`Don't know how to create an empty item of type ${type}`)
  },
}

export function registerJsonArrayProperty() {
  propertyDescriptors.register(jsonArrayPropertyDescriptor)
}
