import { propertyDescriptors } from '@cozemble/model-core'
import { registerModelEvents } from './events'
import { referencePropertyDescriptor } from './referencePropertyDescriptor'

export {
  referencePropertyOptions,
  ReferencePropertyOption,
  referencePropertyFns,
  referencePropertyType,
  ReferenceProperty,
} from './referenceProperty'

export function registerReferenceProperty() {
  propertyDescriptors.register(referencePropertyDescriptor)
  registerModelEvents()
}

export { referencePropertyDescriptor } from './referencePropertyDescriptor'
export {
  newReferencePropertyModelEvent,
  NewReferencePropertyModelEvent,
  referencedModelChangedModelEvent,
} from './events'
