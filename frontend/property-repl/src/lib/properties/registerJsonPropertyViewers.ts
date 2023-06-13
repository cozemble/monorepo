import { slotEditorRegistry, slotViewerRegistry } from '@cozemble/model-assembled'
import { jsonStringPropertyType } from '$lib/properties/JsonProperty'
import JsonPropertyViewer from '$lib/properties/JsonPropertyViewer.svelte'
import JsonPropertyEditor from '$lib/properties/JsonPropertyEditor.svelte'
import { propertyConfigurerRegistry } from '@cozemble/model-assembled'
import JsonPropertyConfigurer from '$lib/properties/JsonPropertyConfigurer.svelte'

export function registerJsonPropertyViewers() {
  slotViewerRegistry.register(jsonStringPropertyType, JsonPropertyViewer)
}

export function registerJsonPropertyEditors() {
  slotEditorRegistry.register(jsonStringPropertyType, JsonPropertyEditor)
}

export function registerJsonPropertyConfigurers() {
  propertyConfigurerRegistry.register(jsonStringPropertyType, JsonPropertyConfigurer)
}
