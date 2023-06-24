import {
  backendFns,
  eventSourcedModelStore,
  makeInMemoryBackend,
} from '@cozemble/frontend-datatable'
import type { ModelView } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'
import { uuids } from '@cozemble/lang-util'
import type { PromptEvent } from '$lib/analytics/types'

export const modelStore = eventSourcedModelStore([])
export const modelViews = writable([] as ModelView[])
export const systemConfiguration = writable(systemConfigurationFns.empty())
export const permitModelling = writable(false)
export const showDevConsole = writable(true)
export const navbarState: Writable<string | null> = writable(null)
export const generationSessionId = writable(uuids.v4())
export const promptIndex = writable(0)

export const promptEvents: Writable<PromptEvent[]> = writable([])

export function newGenerationSessionId() {
  generationSessionId.set(uuids.v4())
  promptEvents.set([])
}

export function addPromptEvent(event: PromptEvent) {
  promptEvents.update((events) => [...events, event])
}

backendFns.setBackend(makeInMemoryBackend())
