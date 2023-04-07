import { propertyDescriptors } from '@cozemble/model-core'
import { registerModelEvents } from './events'
import {
  datePropertyDescriptor,
  registerModelEvents as registedDateModelEvents,
} from './dateProperty'
import { stringPropertyDescriptor } from './stringPropertyDescriptor'

export {
  StringProperty,
  RegexValidation,
  stringPropertyFns,
  StringPropertyOption,
  stringPropertyType,
} from './stringProperty'

export { stringPropertyDescriptor } from './stringPropertyDescriptor'

export {
  newStringPropertyModelEvent,
  NewStringPropertyModelEvent,
  stringMultilineChanged,
} from './events'
export { stringPropertyOptions } from './stringPropertyOptions'

/**
 * Everything above needs to be exported so that it can be used by other packages.  The code below
 * is required to make it easy to register the property descriptor and associated events with the cozemble runtime.
 *
 * This property is a bit weird, in that it registers itselt as the default property type.  Other property types
 * will not have to do this.
 */
export function registerStringProperty() {
  propertyDescriptors.register(stringPropertyDescriptor)
  propertyDescriptors.setDefault(stringPropertyDescriptor)
  propertyDescriptors.register(datePropertyDescriptor)
  registerModelEvents()
  registedDateModelEvents()
}
