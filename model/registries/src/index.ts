import { isJsonProperty, JsonDataType, LeafModelSlot, PropertyType } from '@cozemble/model-core'
import { isJsonPropertyDescriptor, propertyDescriptors } from '@cozemble/model-core/dist/esm'

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
  forPropertyType(propertyType: PropertyType | string) {
    const pd = propertyDescriptors.get(propertyType)
    if (isJsonPropertyDescriptor(pd)) {
      const lookupOrder = [pd.propertyType.value, pd.jsonType.value]
      for (const key of lookupOrder) {
        const viewer = slotViewerMap.get(key)
        if (viewer) {
          return viewer
        }
      }
    }
    const key = typeof propertyType === 'string' ? propertyType : propertyType.value
    return slotViewerMap.get(key) ?? null
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
