import { slotEditorRegistry, slotViewerRegistry } from '@cozemble/model-assembled'
import { jsonStringPropertyType } from '$lib/properties/JsonProperty'
import JsonPropertyViewer from '$lib/properties/JsonPropertyViewer.svelte'
import JsonPropertyEditor from '$lib/properties/JsonPropertyEditor.svelte'
import { propertyConfigurerRegistry } from '@cozemble/model-assembled'
import JsonPropertyConfigurer from '$lib/properties/JsonPropertyConfigurer.svelte'
import { jsonDataTypes } from '@cozemble/model-core'

export function registerJsonPropertyViewers() {
  slotViewerRegistry.register(jsonDataTypes.string, JsonPropertyViewer)
}

export function registerJsonPropertyEditors() {
  slotEditorRegistry.register(jsonDataTypes.string, JsonPropertyEditor)
}

export function registerJsonPropertyConfigurers() {
  propertyConfigurerRegistry.register(jsonStringPropertyType, JsonPropertyConfigurer)
}
