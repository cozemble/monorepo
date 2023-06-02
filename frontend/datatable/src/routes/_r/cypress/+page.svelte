<script lang="ts">
  import type { EventSourcedModel, TimestampedRecordGraphEdge } from '@cozemble/model-event-sourced'
  import type { DataRecord, ModelView } from '@cozemble/model-core'
  import { systemConfigurationFns } from '@cozemble/model-core'
  import { registerEverything } from '@cozemble/model-assembled'
  import { onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { backendFns, eventSourcedModelStore } from '../../../lib'
  import { testModelsLocalStorageKey } from './testModels'
  import { testRecordsLocalStorageKey } from './testModels.js'
  import { makeInMemoryBackend } from '../../../lib/backend/InMemoryBackend'
  import DevOptions from '../../DevOptions.svelte'
  import Editor from '$lib/components/editor/Editor.svelte'
  import { testEdgesLocalStorageKey, testModelViewsLocalStorageKey } from '../../cypress/testModels'

  const modelViews = writable([] as ModelView[])
  let models = [] as EventSourcedModel[]
  const systemConfiguration = systemConfigurationFns.empty()
  const permitModelling = writable(true)
  const showDevConsole = writable(false)

  let mounted = false
  onMount(() => {
    registerEverything()
    const storedModelJson = localStorage.getItem(testModelsLocalStorageKey) ?? '[]'
    const storedRecordsJson = localStorage.getItem(testRecordsLocalStorageKey) ?? '[]'
    const storedModelViewsJson = localStorage.getItem(testModelViewsLocalStorageKey) ?? '[]'
    const storedEdgesJson = localStorage.getItem(testEdgesLocalStorageKey) ?? '[]'
    models = JSON.parse(storedModelJson)
    const edges = JSON.parse(storedEdgesJson) as TimestampedRecordGraphEdge[]
    const records = JSON.parse(storedRecordsJson) as DataRecord[]
    const parsedModelViews = JSON.parse(storedModelViewsJson) as ModelView[]
    modelViews.set(parsedModelViews)
    backendFns.setBackend(makeInMemoryBackend(models, records, edges, parsedModelViews))
    mounted = true
  })
</script>

{#if mounted}
  <DevOptions {permitModelling} {showDevConsole} />
  <Editor
    models={eventSourcedModelStore(models)}
    {modelViews}
    {systemConfiguration}
    userId="test"
    {showDevConsole}
    {permitModelling}
  />
{/if}
