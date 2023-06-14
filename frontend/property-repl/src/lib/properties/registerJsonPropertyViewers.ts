import {
  propertyConfigurerRegistry,
  slotEditorRegistry,
  slotViewerRegistry,
} from '@cozemble/model-assembled'
import JsonPropertyViewer from '$lib/properties/components/JsonPropertyViewer.svelte'
import JsonPropertyEditor from '$lib/properties/components/JsonPropertyEditor.svelte'
import JsonPropertyConfigurer from '$lib/properties/components/JsonPropertyConfigurer.svelte'
import { jsonDataTypes } from '@cozemble/model-core'
import { jsonStringPropertyType } from '$lib/properties/string/JsonStringProperty'
import { jsonNumberPropertyType } from '$lib/properties/number/JsonNumberProperty'

export function registerJsonPropertyViewers() {
  slotViewerRegistry.register(jsonDataTypes.string, JsonPropertyViewer)
  slotViewerRegistry.register(jsonDataTypes.number, JsonPropertyViewer)
}

export function registerJsonPropertyEditors() {
  slotEditorRegistry.register(jsonDataTypes.string, JsonPropertyEditor)
  slotEditorRegistry.register(jsonDataTypes.number, JsonPropertyEditor)
}

export function registerJsonPropertyConfigurers() {
  propertyConfigurerRegistry.register(jsonStringPropertyType, JsonPropertyConfigurer)
  propertyConfigurerRegistry.register(jsonNumberPropertyType, JsonPropertyConfigurer)
}
