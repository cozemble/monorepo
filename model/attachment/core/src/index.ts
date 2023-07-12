import { propertyDescriptors } from '@cozemble/model-core'
import { attachmentPropertyDescriptor } from './attachmentPropertyDescriptor.js'
import { registerModelEvents } from './events.js'

export {
  AttachmentProperty,
  attachmentPropertyFns,
  attachmentPropertyType,
  AttachmentPropertyOption,
  attachmentPropertyOptions,
  emptyProperty,
  AttachmentPropertyConfiguration,
} from './attachmentProperty.js'

export {
  attachmentPropertyDescriptor,
  AttachmentReference,
  AttachmentList,
  Size,
} from './attachmentPropertyDescriptor.js'

export {
  registerModelEvents,
  newAttachmentPropertyModelEvent,
  attachmentModelChangedModelEvent,
} from './events.js'

export function registerAttachmentProperty() {
  propertyDescriptors.register(attachmentPropertyDescriptor)
  registerModelEvents()
}
