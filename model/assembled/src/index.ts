import type { PropertyType } from '@cozemble/model-core'
import { LeafModelSlot } from '@cozemble/model-core'
import {
  PropertyConfigurer as StringPropertyConfigurer,
  PropertyEditor as StringPropertyEditor,
  PropertyViewer as StringPropertyViewer,
} from '@cozemble/model-string-ui'
import {
  PropertyConfigurer as DatePropertyConfigurer,
  PropertyEditor as DatePropertyEditor,
  PropertyViewer as DatePropertyViewer,
} from '@cozemble/model-date-ui'
import {
  PropertyConfigurer as IntegerPropertyConfigurer,
  PropertyEditor as IntegerPropertyEditor,
  PropertyViewer as IntegerPropertyViewer,
} from '@cozemble/model-integer-ui'
import { registerStringProperty, stringPropertyType } from '@cozemble/model-string-core'
import { datePropertyType, registerDateProperty } from '@cozemble/model-date-core'
import { attachmentPropertyType, registerAttachmentProperty } from '@cozemble/model-attachment-core'
import {
  AttachmentPropertyConfigurer,
  AttachmentPropertyEditor,
  AttachmentPropertyViewer,
} from '@cozemble/model-attachment-ui'
import { registerDateSystemConfiguration } from '@cozemble/model-date-ui'
import { integerPropertyType, registerIntegerProperty } from '@cozemble/model-integer-core'

export { propertyDescriptors } from '@cozemble/model-core'

const propertyConfigurerMap = new Map<string, any>()
const slotViewerMap = new Map<string, any>()
const slotEditorMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
  register: (propertyType: PropertyType, component: any) => {
    propertyConfigurerMap.set(propertyType.value, component)
  },
  get: (propertyType: PropertyType) => {
    return propertyConfigurerMap.get(propertyType.value) ?? null
  },
}

export type SlotKey = PropertyType | 'model.reference'

function keyValue(slotKey: SlotKey) {
  return typeof slotKey === 'string' ? slotKey : slotKey.value
}

function keyForSlot(slot: LeafModelSlot): string {
  if (slot._type === 'property') {
    return slot.propertyType.value
  }
  return 'model.reference'
}

export const slotViewerRegistry = {
  register: (slotKey: SlotKey, component: any) => {
    slotViewerMap.set(keyValue(slotKey), component)
  },
  forSlot: (slot: LeafModelSlot) => {
    return slotViewerMap.get(keyForSlot(slot)) ?? null
  },
}

export const slotEditorRegistry = {
  register: (slotKey: SlotKey, component: any) => {
    slotEditorMap.set(keyValue(slotKey), component)
  },
  forSlot: (slot: LeafModelSlot) => {
    return slotEditorMap.get(keyForSlot(slot)) ?? null
  },
}

export function registerAllProperties() {
  registerStringProperty()
  registerDateProperty()
  registerIntegerProperty()
  registerAttachmentProperty()
}

export function registerAllPropertyConfigurers() {
  propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
  propertyConfigurerRegistry.register(datePropertyType, DatePropertyConfigurer)
  propertyConfigurerRegistry.register(integerPropertyType, IntegerPropertyConfigurer)
  propertyConfigurerRegistry.register(attachmentPropertyType, AttachmentPropertyConfigurer)
}

export function registerAllSlotViewers() {
  slotViewerRegistry.register(stringPropertyType, StringPropertyViewer)
  slotViewerRegistry.register(datePropertyType, DatePropertyViewer)
  slotViewerRegistry.register(integerPropertyType, IntegerPropertyViewer)
  slotViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
}

export function registerAllSlotEditors() {
  slotEditorRegistry.register(stringPropertyType, StringPropertyEditor)
  slotEditorRegistry.register(datePropertyType, DatePropertyEditor)
  slotEditorRegistry.register(integerPropertyType, IntegerPropertyEditor)
  slotEditorRegistry.register(attachmentPropertyType, AttachmentPropertyEditor)
}

export function registerAllSystemConfigurations() {
  registerDateSystemConfiguration()
}
