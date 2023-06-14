import type { PropertyType } from '@cozemble/model-core'
import { jsonDataTypes } from '@cozemble/model-core'
import { propertyFns } from '@cozemble/model-api'
import type { JsonSchema } from '$lib/types/types'
import type { JsonStringProperty } from '$lib/properties/JsonStringProperty'
import {
  jsonStringPropertyType,
  registerJsonStringProperty,
} from '$lib/properties/JsonStringProperty'
import { registerJsonPropertyEvents } from '$lib/properties/events'
import { registerDerivedProperties } from '$lib/properties/derived/derivedProperties'

export const propertyConfigurationSchemaMap = new Map<string, JsonSchema>()

export const propertyConfigurationSchemas = {
  register(propertyType: PropertyType, schema: JsonSchema) {
    propertyConfigurationSchemaMap.set(propertyType.value, schema)
  },
  get(propertyType: PropertyType): JsonSchema | null {
    return propertyConfigurationSchemaMap.get(propertyType.value) ?? null
  },
}

export const jsonProperty = {
  string(name: string): JsonStringProperty {
    return {
      ...propertyFns.newInstance(name),
      jsonType: jsonDataTypes.string,
      propertyType: jsonStringPropertyType,
      configuration: { pattern: '' },
    }
  },
}

export function registerJsonProperties() {
  registerJsonStringProperty()
  registerJsonPropertyEvents()
  registerDerivedProperties()
}
