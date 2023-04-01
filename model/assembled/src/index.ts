import type { PropertyType } from '@cozemble/model-core'
import {
  PropertyConfigurer as StringPropertyConfigurer,
  PropertyEditor as StringPropertyEditor,
  PropertyViewer as StringPropertyViewer,
} from '@cozemble/model-string-ui'
import { registerStringProperty, stringPropertyType } from '@cozemble/model-string-core'
import { referencePropertyType, registerReferenceProperty } from '@cozemble/model-reference-core'
import {
  ReferencePropertyConfigurer,
  ReferencePropertyEditor,
  ReferencePropertyViewer,
} from '@cozemble/model-reference-ui'
import { attachmentPropertyType, registerAttachmentProperty } from '@cozemble/model-attachment-core'
import {
  AttachmentPropertyConfigurer,
  AttachmentPropertyEditor,
  AttachmentPropertyViewer,
} from '@cozemble/model-attachment-ui'
import { LeafModelSlot } from '@cozemble/model-core/dist/esm'

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
  registerReferenceProperty()
  registerAttachmentProperty()
}

export function registerAllPropertyConfigurers() {
  propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
  propertyConfigurerRegistry.register(referencePropertyType, ReferencePropertyConfigurer)
  propertyConfigurerRegistry.register(attachmentPropertyType, AttachmentPropertyConfigurer)
}

export function registerAllSlotViewers() {
  slotViewerRegistry.register(stringPropertyType, StringPropertyViewer)
  slotViewerRegistry.register(referencePropertyType, ReferencePropertyViewer)
  slotViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
}

export function registerAllSlotEditors() {
  slotEditorRegistry.register(stringPropertyType, StringPropertyEditor)
  slotEditorRegistry.register(referencePropertyType, ReferencePropertyEditor)
  slotEditorRegistry.register(attachmentPropertyType, AttachmentPropertyEditor)
}
