<script lang="ts">
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { ModelView } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import { registerEverything } from '@cozemble/model-assembled'
import { onMount } from 'svelte'
import { writable } from 'svelte/store'
import { backendFns, DataTable, eventSourcedModelStore } from '../../../lib'
import { InMemoryBackend } from '../../../lib/backend/InMemoryBackend'
import Editor from '$lib/components/editor/Editor.svelte'

const modelViews = writable([] as ModelView[])
const models = [] as EventSourcedModel[]
const systemConfiguration = systemConfigurationFns.empty()
backendFns.setBackend(new InMemoryBackend())

onMount(() => {
  registerEverything()
})
</script>

<Editor
  models={eventSourcedModelStore(models)}
  {modelViews}
  {systemConfiguration}
  userId="test"
/>
