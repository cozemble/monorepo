import { jsonDataTypes } from '@cozemble/model-core'
import { propertyFns } from '@cozemble/model-api'
import type { JsonStringProperty } from '$lib/properties/string/JsonStringProperty'
import {
  jsonStringPropertyType,
  registerJsonStringProperty,
} from '$lib/properties/string/JsonStringProperty'
import { registerJsonPropertyEvents } from '$lib/properties/events'
import { registerDerivedProperties } from '$lib/properties/derived/derivedProperties'
import { registerJsonNumberProperty } from '$lib/properties/number/JsonNumberProperty'
import { registerJsonDateProperty } from '$lib/properties/date/JsonDateProperty'

export const jsonProperty = {
  string(name: string): JsonStringProperty {
    return {
      ...propertyFns.newInstance(name),
      jsonType: jsonDataTypes.string,
      propertyType: jsonStringPropertyType,
      configuration: { _type: 'string.property.configuration' },
    }
  },
}

export function registerJsonProperties() {
  registerJsonStringProperty()
  registerJsonNumberProperty()
  registerJsonDateProperty()
  registerJsonPropertyEvents()
  registerDerivedProperties()
}
