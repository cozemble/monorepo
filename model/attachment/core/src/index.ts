import { propertyDescriptors } from '@cozemble/model-core'
import { attachmentPropertyDescriptor } from './attachmentPropertyDescriptor'
import { registerModelEvents } from './events'

export {
  AttachmentProperty,
  attachmentPropertyFns,
  attachmentPropertyType,
  AttachmentPropertyOption,
  attachmentPropertyOptions,
  emptyProperty,
} from './attachmentProperty'

export {
  attachmentPropertyDescriptor,
  AttachmentReference,
  AttachmentList,
  Size,
} from './attachmentPropertyDescriptor'

export {
  registerModelEvents,
  newAttachmentPropertyModelEvent,
  attachmentModelChangedModelEvent,
} from './events'

export function registerAttachmentProperty() {
  propertyDescriptors.register(attachmentPropertyDescriptor)
  registerModelEvents()
}
