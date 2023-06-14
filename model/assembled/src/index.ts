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
  registerDateSystemConfiguration,
} from '@cozemble/model-date-ui'
import {
  PropertyConfigurer as IntegerPropertyConfigurer,
  PropertyEditor as IntegerPropertyEditor,
  PropertyViewer as IntegerPropertyViewer,
} from '@cozemble/model-integer-ui'
import {
  PropertyConfigurer as DecimalPropertyConfigurer,
  PropertyEditor as DecimalPropertyEditor,
  PropertyViewer as DecimalPropertyViewer,
} from '@cozemble/model-decimal-ui'
import { registerStringProperty, stringPropertyType } from '@cozemble/model-string-core'
import { datePropertyType, registerDateProperty } from '@cozemble/model-date-core'
import { attachmentPropertyType, registerAttachmentProperty } from '@cozemble/model-attachment-core'
import {
  AttachmentPropertyConfigurer,
  AttachmentPropertyEditor,
  AttachmentPropertyViewer,
} from '@cozemble/model-attachment-ui'
import { integerPropertyType, registerIntegerProperty } from '@cozemble/model-integer-core'
import { decimalPropertyType, registerDecimalProperty } from '@cozemble/model-decimal-core'
import { currencyPropertyType, registerCurrencyProperty } from '@cozemble/model-currency-core'
import {
  PropertyConfigurer as CurrencyPropertyConfigurer,
  PropertyEditor as CurrencyPropertyEditor,
  PropertyViewer as CurrencyPropertyViewer,
} from '@cozemble/model-currency-ui'
import { JsonDataType } from '@cozemble/model-core'

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

export type SlotKey = PropertyType | JsonDataType | 'model.reference'

function keyValue(slotKey: SlotKey) {
  return typeof slotKey === 'string' ? slotKey : slotKey.value
}

function keyForSlot(slot: LeafModelSlot): string {
  if (slot._type === 'property') {
    if (slot.propertyType.value === 'json.string.property') {
    }
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
  registerStringProperty()
  registerDateProperty()
  registerIntegerProperty()
  registerDecimalProperty()
  registerAttachmentProperty()
  registerCurrencyProperty()
}

export function registerAllPropertyConfigurers() {
  propertyConfigurerRegistry.register(stringPropertyType, StringPropertyConfigurer)
  propertyConfigurerRegistry.register(datePropertyType, DatePropertyConfigurer)
  propertyConfigurerRegistry.register(integerPropertyType, IntegerPropertyConfigurer)
  propertyConfigurerRegistry.register(decimalPropertyType, DecimalPropertyConfigurer)
  propertyConfigurerRegistry.register(attachmentPropertyType, AttachmentPropertyConfigurer)
  propertyConfigurerRegistry.register(currencyPropertyType, CurrencyPropertyConfigurer)
}

export function registerAllSlotViewers() {
  slotViewerRegistry.register(stringPropertyType, StringPropertyViewer)
  slotViewerRegistry.register(datePropertyType, DatePropertyViewer)
  slotViewerRegistry.register(integerPropertyType, IntegerPropertyViewer)
  slotViewerRegistry.register(decimalPropertyType, DecimalPropertyViewer)
  slotViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
  slotViewerRegistry.register(currencyPropertyType, CurrencyPropertyViewer)
}

export function registerAllSlotEditors() {
  slotEditorRegistry.register(stringPropertyType, StringPropertyEditor)
  slotEditorRegistry.register(datePropertyType, DatePropertyEditor)
  slotEditorRegistry.register(integerPropertyType, IntegerPropertyEditor)
  slotEditorRegistry.register(decimalPropertyType, DecimalPropertyEditor)
  slotEditorRegistry.register(attachmentPropertyType, AttachmentPropertyEditor)
  slotEditorRegistry.register(currencyPropertyType, CurrencyPropertyEditor)
}

export function registerAllSystemConfigurations() {
  registerDateSystemConfiguration()
}

export function registerEverything() {
  registerAllProperties()
  registerAllPropertyConfigurers()
  registerAllSlotViewers()
  registerAllSlotEditors()
  registerAllSystemConfigurations()
}
