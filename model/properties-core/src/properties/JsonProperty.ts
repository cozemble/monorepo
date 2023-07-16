import { registerJsonStringProperty } from './string/JsonStringProperty.ts'
import { registerJsonNumberProperty } from './number/JsonNumberProperty.ts'
import { registerJsonDateProperty } from './date/JsonDateProperty.ts'
import { registerJsonPropertyEvents } from './events.ts'
import { registerDerivedProperties } from './derived/derivedProperties.ts'
import { registerJsonArrayProperty } from './array/JsonArrayProperty.ts'

export function registerJsonProperties() {
  registerJsonStringProperty()
  registerJsonNumberProperty()
  registerJsonDateProperty()
  registerJsonPropertyEvents()
  registerDerivedProperties()
  registerJsonArrayProperty()
}
