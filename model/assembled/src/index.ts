import type { PropertyType } from '@cozemble/model-core'
import {
  PropertyConfigurer as StringPropertyConfigurer,
  PropertyEditor as StringPropertyEditor,
  PropertyViewer as StringPropertyViewer,
} from '@cozemble/model-string-ui'
import { stringPropertyType, registerStringProperty } from '@cozemble/model-string-core'
import { registerReferenceProperty } from '@cozemble/model-reference-core'
import { referencePropertyType } from '@cozemble/model-reference-core'
import { ReferencePropertyConfigurer } from '@cozemble/model-reference-ui'

export { propertyDescriptors } from '@cozemble/model-core'

const propertyConfigurerMap = new Map<string, any>()
const propertyViewerMap = new Map<string, any>()
const propertyEditorMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
  register: (propertyType: PropertyType, component: any) => {
    propertyConfigurerMap.set(propertyType.type, component)
    console.log('propertyConfigurerMap', propertyConfigurerMap)
  },
  get: (propertyType: PropertyType) => {
    console.log('propertyConfigurerMap', propertyConfigurerMap)
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
}

export function registerAllPropertyConfigurers() {
  propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
  propertyConfigurerRegistry.register(referencePropertyType, ReferencePropertyConfigurer)
}

export function registerAllPropertyViewers() {
  propertyViewerRegistry.register(stringPropertyType, StringPropertyViewer)
}

export function registerAllPropertyEditors() {
  propertyEditorRegistry.register(stringPropertyType, StringPropertyEditor)
}
