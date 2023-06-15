import {
  propertyConfigurerRegistry,
  slotEditorRegistry,
  slotViewerRegistry,
} from '@cozemble/model-assembled'
import JsonPropertyViewer from '$lib/properties/components/JsonPropertyViewer.svelte'
import JsonPropertyEditor from '$lib/properties/components/JsonPropertyEditor.svelte'
import JsonPropertyConfigurer from '$lib/properties/components/JsonPropertyConfigurer.svelte'
import { jsonDataTypes } from '@cozemble/model-core'

export function registerJsonPropertyViewers() {
  slotViewerRegistry.register(jsonDataTypes.string, JsonPropertyViewer)
  slotViewerRegistry.register(jsonDataTypes.number, JsonPropertyViewer)
}

export function registerJsonPropertyEditors() {
  slotEditorRegistry.register(jsonDataTypes.string, JsonPropertyEditor)
  slotEditorRegistry.register(jsonDataTypes.number, JsonPropertyEditor)
}

export function registerJsonPropertyConfigurers() {
  propertyConfigurerRegistry.register(jsonDataTypes.string, JsonPropertyConfigurer)
  propertyConfigurerRegistry.register(jsonDataTypes.number, JsonPropertyConfigurer)
}
