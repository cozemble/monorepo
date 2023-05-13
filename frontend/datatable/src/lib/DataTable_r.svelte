<!-- TODO (refactor): move into '$lib/components/EditorWrapper.svelte' -->
<script lang="ts">
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { onMount } from 'svelte'

// Cozemble
import type { ModelView, SystemConfiguration } from '@cozemble/model-core'
import { customNaming } from '@cozemble/model-editor'
import {
  slotEditorRegistry,
  slotViewerRegistry,
} from '@cozemble/model-assembled'
import {
  ModelReferenceEditor,
  ModelReferenceViewer,
} from '@cozemble/data-paginated-editor'

import { setAllModelViews } from './stores/allModelViews'
import { setAllEventSourcedModels } from './stores/allModels'
import { currentUserId } from './stores/currentUserId'
import { systemConfiguration as systemConfigurationStore } from './stores/systemConfiguration'
import DataTableInner from './DataTableInner_r.svelte'
import { recordFilteringComponentStore } from './stores/recordFilteringComponentStore'
import type { EventSourcedModelStore } from './types'
import { contextHelper } from './stores/contextHelper'

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
  <DataTableInner {navbarState} />
{/if}
