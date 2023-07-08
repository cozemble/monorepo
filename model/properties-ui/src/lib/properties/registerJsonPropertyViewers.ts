import JsonPropertyViewer from '$lib/properties/components/JsonPropertyViewer.svelte'
import JsonPropertyEditor from '$lib/properties/components/JsonPropertyEditor.svelte'
import JsonPropertyConfigurer from '$lib/properties/components/JsonPropertyConfigurer.svelte'
import { type JsonDataType, jsonDataTypes, type PropertyType } from '@cozemble/model-core'
import JsonDateEditor from '$lib/properties/date/JsonDateEditor.svelte'
import { jsonDatePropertyDescriptor } from '@cozemble/model-properties-core'
import JsonArrayPropertyViewer from './array/JsonArrayPropertyViewer.svelte'

export interface Registry {
  register(type: PropertyType | JsonDataType, component: any): void
}

export function registerJsonPropertyViewers(slotViewerRegistry: Registry) {
  slotViewerRegistry.register(jsonDataTypes.string, JsonPropertyViewer)
  slotViewerRegistry.register(jsonDataTypes.number, JsonPropertyViewer)
  slotViewerRegistry.register(jsonDataTypes.array, JsonArrayPropertyViewer)
}

export function registerJsonPropertyEditors(slotEditorRegistry: Registry) {
  slotEditorRegistry.register(jsonDataTypes.string, JsonPropertyEditor)
  slotEditorRegistry.register(jsonDatePropertyDescriptor.propertyType, JsonDateEditor)
  slotEditorRegistry.register(jsonDataTypes.number, JsonPropertyEditor)
}

export function registerJsonPropertyConfigurers(propertyConfigurerRegistry: Registry) {
  propertyConfigurerRegistry.register(jsonDataTypes.string, JsonPropertyConfigurer)
  propertyConfigurerRegistry.register(jsonDataTypes.number, JsonPropertyConfigurer)
  propertyConfigurerRegistry.register(jsonDataTypes.array, JsonPropertyConfigurer)
}
