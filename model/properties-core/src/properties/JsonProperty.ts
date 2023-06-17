import { registerJsonStringProperty } from './string/JsonStringProperty'
import { registerJsonNumberProperty } from './number/JsonNumberProperty'
import { registerJsonDateProperty } from './date/JsonDateProperty'
import { registerJsonPropertyEvents } from './events'
import { registerDerivedProperties } from './derived/derivedProperties'

export function registerJsonProperties() {
  registerJsonStringProperty()
  registerJsonNumberProperty()
  registerJsonDateProperty()
  registerJsonPropertyEvents()
  registerDerivedProperties()
}
