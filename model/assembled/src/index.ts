import type { PropertyType } from '@cozemble/model-core'
import {
  PropertyConfigurer as StringPropertyConfigurer,
  PropertyEditor as StringPropertyEditor,
  PropertyViewer as StringPropertyViewer,
} from '@cozemble/model-string-ui'
import { stringPropertyType } from '@cozemble/model-string-core'
import { registerStringProperty } from '@cozemble/model-string-core'

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
}

export function registerAllPropertyConfigurers() {
  propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
}

export function registerAllPropertyViewers() {
  propertyViewerRegistry.register(stringPropertyType, StringPropertyViewer)
}

export function registerAllPropertyEditors() {
  propertyEditorRegistry.register(stringPropertyType, StringPropertyEditor)
}
