import { registerJsonStringProperty } from './string/JsonStringProperty.js'
import { registerJsonNumberProperty } from './number/JsonNumberProperty.js'
import { registerJsonDateProperty } from './date/JsonDateProperty.js'
import { registerJsonPropertyEvents } from './events.js'
import { registerDerivedProperties } from './derived/derivedProperties.js'
import { registerJsonArrayProperty } from './array/JsonArrayProperty.js'

export function registerJsonProperties() {
  registerJsonStringProperty()
  registerJsonNumberProperty()
  registerJsonDateProperty()
  registerJsonPropertyEvents()
  registerDerivedProperties()
  registerJsonArrayProperty()
}
