import type { PropertyType } from '@cozemble/model-core'
import { isJsonProperty, JsonDataType, LeafModelSlot } from '@cozemble/model-core'
import { attachmentPropertyType, registerAttachmentProperty } from '@cozemble/model-attachment-core'
import {
  AttachmentPropertyConfigurer,
  AttachmentPropertyEditor,
  AttachmentPropertyViewer,
} from '@cozemble/model-attachment-ui'
import { currencyPropertyType, registerCurrencyProperty } from '@cozemble/model-currency-core'
import {
  PropertyConfigurer as CurrencyPropertyConfigurer,
  PropertyEditor as CurrencyPropertyEditor,
  PropertyViewer as CurrencyPropertyViewer,
} from '@cozemble/model-currency-ui'
import { registerJsonProperties } from '@cozemble/model-properties-core'
import {
  registerJsonPropertyConfigurers,
  registerJsonPropertyEditors,
  registerJsonPropertyViewers,
} from '@cozemble/model-properties-ui'

export { propertyDescriptors } from '@cozemble/model-core'

const propertyConfigurerMap = new Map<string, any>()
const slotViewerMap = new Map<string, any>()
const slotEditorMap = new Map<string, any>()

export const propertyConfigurerRegistry = {
  register: (slotType: PropertyType | JsonDataType, component: any) => {
    propertyConfigurerMap.set(slotType.value, component)
  },
  get: (propertyType: PropertyType) => {
    return propertyConfigurerMap.get(propertyType.value) ?? null
  },
  forSlot: (slot: LeafModelSlot) => {
    for (const key of orderedLookupOptions(slot)) {
      const configurer = propertyConfigurerMap.get(key) ?? null
      if (configurer) {
        return configurer
      }
    }
    return null
  },
}

export type SlotKey = PropertyType | JsonDataType | 'model.reference'

function keyValue(slotKey: SlotKey) {
  return typeof slotKey === 'string' ? slotKey : slotKey.value
}

function orderedLookupOptions(slot: LeafModelSlot): string[] {
  if (isJsonProperty(slot)) {
    return [slot.propertyType.value, slot.jsonType.value]
  }
  if (slot._type === 'property') {
    return [slot.propertyType.value]
  }
  return ['model.reference']
}

export const slotViewerRegistry = {
  register: (slotKey: SlotKey, component: any) => {
    slotViewerMap.set(keyValue(slotKey), component)
  },
  forSlot: (slot: LeafModelSlot) => {
    for (const key of orderedLookupOptions(slot)) {
      const viewer = slotViewerMap.get(key)
      if (viewer) {
        return viewer
      }
    }
    return null
  },
}

export const slotEditorRegistry = {
  register: (slotKey: SlotKey, component: any) => {
    slotEditorMap.set(keyValue(slotKey), component)
  },
  forSlot: (slot: LeafModelSlot) => {
    for (const key of orderedLookupOptions(slot)) {
      const editor = slotEditorMap.get(key)
      if (editor) {
        return editor
      }
    }
    return null
  },
  contractForSlot(slot: LeafModelSlot): 'simple' | 'classic' {
    if (
      slot._type === 'property' &&
      (slot.propertyType.value === 'string.property' ||
        slot.propertyType.value === 'attachment.property' ||
        slot.propertyType.value === 'integer.property' ||
        slot.propertyType.value === 'decimal.property' ||
        slot.propertyType.value.startsWith('json.'))
    ) {
      return 'simple'
    }
    return 'classic'
  },
}

export function registerAllProperties() {
  registerJsonProperties()
  // registerStringProperty()
  // registerDateProperty()
  // registerIntegerProperty()
  // registerDecimalProperty()
  registerAttachmentProperty()
  registerCurrencyProperty()
}

export function registerAllPropertyConfigurers() {
  registerJsonPropertyConfigurers(propertyConfigurerRegistry)
  // propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
  // propertyConfigurerRegistry.register(datePropertyType, DatePropertyConfigurer)
  // propertyConfigurerRegistry.register(integerPropertyType, IntegerPropertyConfigurer)
  // propertyConfigurerRegistry.register(decimalPropertyType, DecimalPropertyConfigurer)
  propertyConfigurerRegistry.register(attachmentPropertyType, AttachmentPropertyConfigurer)
  propertyConfigurerRegistry.register(currencyPropertyType, CurrencyPropertyConfigurer)
}

export function registerAllSlotViewers() {
  registerJsonPropertyViewers(slotViewerRegistry)
  // slotViewerRegistry.register(stringPropertyType, StringPropertyViewer)
  // slotViewerRegistry.register(datePropertyType, DatePropertyViewer)
  // slotViewerRegistry.register(integerPropertyType, IntegerPropertyViewer)
  // slotViewerRegistry.register(decimalPropertyType, DecimalPropertyViewer)
  slotViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
  slotViewerRegistry.register(currencyPropertyType, CurrencyPropertyViewer)
}

export function registerAllSlotEditors() {
  registerJsonPropertyEditors(slotEditorRegistry)
  // slotEditorRegistry.register(stringPropertyType, StringPropertyEditor)
  // slotEditorRegistry.register(datePropertyType, DatePropertyEditor)
  // slotEditorRegistry.register(integerPropertyType, IntegerPropertyEditor)
  // slotEditorRegistry.register(decimalPropertyType, DecimalPropertyEditor)
  slotEditorRegistry.register(attachmentPropertyType, AttachmentPropertyEditor)
  slotEditorRegistry.register(currencyPropertyType, CurrencyPropertyEditor)
}

export function registerAllSystemConfigurations() {
  // registerDateSystemConfiguration()
}

export function registerEverything() {
  registerAllProperties()
  registerAllPropertyConfigurers()
  registerAllSlotViewers()
  registerAllSlotEditors()
  registerAllSystemConfigurations()
}
