import {
  backendFns,
  eventSourcedModelStore,
  makeInMemoryBackend,
} from '@cozemble/frontend-datatable'
import type { DataRecord, ModelView } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { writable, derived } from 'svelte/store'
import { uuids } from '@cozemble/lang-util'
import type { GeneratedDataBatch } from '$lib/generative/generateData'

export const modelStore = eventSourcedModelStore([])
export const allModels = derived(modelStore, (modelStore) =>
  modelStore.models.map((model) => model.model),
)
export const modelViews = writable([] as ModelView[])
export const systemConfiguration = writable(systemConfigurationFns.empty())
export const permitModelling = writable(false)
export const showDevConsole = writable(false)
export const navbarState: Writable<string | null> = writable(null)
export const generationSessionId = writable(uuids.v4())
export const promptIndex = writable(0)
export const generatedDataBatches = writable([] as GeneratedDataBatch[])
export const appliedDataBatchIds = writable([] as string[])
export const replicatedRecords = writable([] as DataRecord[])

export function newGenerationSessionId() {
  generationSessionId.set(uuids.v4())
  generatedDataBatches.set([])
  appliedDataBatchIds.set([])
  replicatedRecords.set([])
  ;(inMemoryBackend as any).clearState()
}

export const inMemoryBackend = makeInMemoryBackend()
backendFns.setBackend(inMemoryBackend)
