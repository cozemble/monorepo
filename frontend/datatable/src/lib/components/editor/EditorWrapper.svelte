<script lang="ts">
// types
import type { Writable } from 'svelte/store'
import type { ModelView, SystemConfiguration } from '@cozemble/model-core'
import type { EventSourcedModelStore } from '../../types'

import { writable } from 'svelte/store'
import { onMount } from 'svelte'

// Cozemble
import { customNaming } from '@cozemble/model-editor'
import {
  slotEditorRegistry,
  slotViewerRegistry,
} from '@cozemble/model-assembled'
import {
  ModelReferenceEditor,
  ModelReferenceViewer,
} from '@cozemble/data-paginated-editor'

// stores
import { setAllModelViews } from '../../stores/allModelViews'
import { setAllEventSourcedModels } from '../../stores/allModels'
import { currentUserId } from '../../stores/currentUserId'
import { systemConfiguration as systemConfigurationStore } from '../../stores/systemConfiguration'
import { recordFilteringComponentStore } from '../../stores/recordFilteringComponentStore'
import { contextHelper } from '../../stores/contextHelper'
// components
import Editor from './Editor.svelte'

export let permitModelling = writable(true)
export let showDevConsole = writable(false)

export let systemConfiguration: SystemConfiguration
export let userId: string

export let navbarState: Writable<string | null> = writable(null)
export let recordFilteringComponent: any | null = null

export let models: EventSourcedModelStore
export let modelViews: Writable<ModelView[]>

// dev options
contextHelper.setPermitModelling(permitModelling)
contextHelper.setShowDevConsole(showDevConsole)

// system configuration
systemConfigurationStore.set(systemConfiguration)
currentUserId.set(userId)

// models
setAllEventSourcedModels(models)
setAllModelViews(modelViews)

recordFilteringComponentStore.set(recordFilteringComponent)

// display the editor when everything is ready
let mounted = false

onMount(() => {
  // ? why register here?
  slotViewerRegistry.register('model.reference', ModelReferenceViewer)
  slotEditorRegistry.register('model.reference', ModelReferenceEditor)

  // ? why is this here?
  customNaming('Table', 'Tables')

  mounted = true
})
</script>

{#if mounted}
  <Editor {navbarState} />
{/if}
