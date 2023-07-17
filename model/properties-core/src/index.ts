export { registerJsonProperties } from './properties/JsonProperty.ts'
export { jsonDatePropertyDescriptor } from './properties/date/JsonDateProperty.ts'
export {
  jsonStringPropertyOptions,
  jsonStringPropertyFns,
  registerJsonStringProperty,
  stringPropertyType,
  StringPropertyConfiguration,
} from './properties/string/JsonStringProperty.ts'

export { datePropertyType } from './properties/date/JsonDateProperty.ts'
export {
  numberPropertyType,
  NumberPropertyConfiguration,
} from './properties/number/JsonNumberProperty.ts'

export {
  integerPropertyType,
  phoneNumberPropertyType,
  emailPropertyType,
  timePropertyType,
} from './properties/derived/derivedProperties.ts'

export {
  type JsonArrayProperty,
  ArrayPropertyConfiguration,
  jsonArrayPropertyDescriptor,
  arrayPropertyType,
} from './properties/array/JsonArrayProperty.ts'
