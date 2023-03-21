import type { PropertyType } from '@cozemble/model-core'
import {
  PropertyConfigurer as StringPropertyConfigurer,
  PropertyEditor as StringPropertyEditor,
  PropertyViewer as StringPropertyViewer,
} from '@cozemble/model-string-ui'
import { stringPropertyType, registerStringProperty } from '@cozemble/model-string-core'
import { registerReferenceProperty } from '@cozemble/model-reference-core'
import { referencePropertyType } from '@cozemble/model-reference-core'
import {
  ReferencePropertyConfigurer,
  ReferencePropertyViewer,
  ReferencePropertyEditor,
} from '@cozemble/model-reference-ui'
import { registerAttachmentProperty } from '@cozemble/model-attachment-core'
import { attachmentPropertyType } from '@cozemble/model-attachment-core'
import {
  AttachmentPropertyConfigurer,
  AttachmentPropertyViewer,
} from '@cozemble/model-attachment-ui'

export { propertyDescriptors } from '@cozemble/model-core'

const propertyConfigurerMap = new Map<string, any>()
const propertyViewerMap = new Map<string, any>()
const propertyEditorMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
  register: (propertyType: PropertyType, component: any) => {
    propertyConfigurerMap.set(propertyType.type, component)
  },
  get: (propertyType: PropertyType) => {
    return propertyConfigurerMap.get(propertyType.type) ?? null
  },
}

export const propertyViewerRegistry = {
  register: (propertyType: PropertyType, component: any) => {
    propertyViewerMap.set(propertyType.type, component)
  },
  get: (propertyType: PropertyType) => {
    return propertyViewerMap.get(propertyType.type) ?? null
  },
}

export const propertyEditorRegistry = {
  register: (propertyType: PropertyType, component: any) => {
    propertyEditorMap.set(propertyType.type, component)
  },
  get: (propertyType: PropertyType) => {
    return propertyEditorMap.get(propertyType.type) ?? null
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

export function registerAllPropertyViewers() {
  propertyViewerRegistry.register(stringPropertyType, StringPropertyViewer)
  propertyViewerRegistry.register(referencePropertyType, ReferencePropertyViewer)
  propertyViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
}

export function registerAllPropertyEditors() {
  propertyEditorRegistry.register(stringPropertyType, StringPropertyEditor)
  propertyEditorRegistry.register(referencePropertyType, ReferencePropertyEditor)
}
