export { registerJsonProperties } from './properties/JsonProperty.js'
export { jsonDatePropertyDescriptor } from './properties/date/JsonDateProperty.js'
export {
  jsonStringPropertyOptions,
  jsonStringPropertyFns,
  registerJsonStringProperty,
  stringPropertyType,
  StringPropertyConfiguration,
} from './properties/string/JsonStringProperty.js'

export { datePropertyType } from './properties/date/JsonDateProperty.js'
export {
  numberPropertyType,
  NumberPropertyConfiguration,
} from './properties/number/JsonNumberProperty.js'

export {
  integerPropertyType,
  phoneNumberPropertyType,
  emailPropertyType,
  timePropertyType,
} from './properties/derived/derivedProperties.js'

export {
  JsonArrayProperty,
  ArrayPropertyConfiguration,
  jsonArrayPropertyDescriptor,
  arrayPropertyType,
} from './properties/array/JsonArrayProperty.js'
