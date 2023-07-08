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
import {
  propertyConfigurerRegistry,
  slotEditorRegistry,
  slotViewerRegistry,
} from '@cozemble/model-registries'

export function registerAllProperties() {
  registerJsonProperties()
  registerAttachmentProperty()
  registerCurrencyProperty()
}

export function registerAllPropertyConfigurers() {
  registerJsonPropertyConfigurers(propertyConfigurerRegistry)
  propertyConfigurerRegistry.register(attachmentPropertyType, AttachmentPropertyConfigurer)
  propertyConfigurerRegistry.register(currencyPropertyType, CurrencyPropertyConfigurer)
}

export function registerAllSlotViewers() {
  registerJsonPropertyViewers(slotViewerRegistry)
  slotViewerRegistry.register(attachmentPropertyType, AttachmentPropertyViewer)
  slotViewerRegistry.register(currencyPropertyType, CurrencyPropertyViewer)
}

export function registerAllSlotEditors() {
  registerJsonPropertyEditors(slotEditorRegistry)
  slotEditorRegistry.register(attachmentPropertyType, AttachmentPropertyEditor)
  slotEditorRegistry.register(currencyPropertyType, CurrencyPropertyEditor)
}

export function registerAllSystemConfigurations() {}

export function registerEverything() {
  registerAllProperties()
  registerAllPropertyConfigurers()
  registerAllSlotViewers()
  registerAllSlotEditors()
  registerAllSystemConfigurations()
}
