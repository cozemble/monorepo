import {
  backendFns,
  eventSourcedModelStore,
  makeInMemoryBackend,
} from '@cozemble/frontend-datatable'
import type { ModelView } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import type { Writable } from 'svelte/store'
import { writable } from 'svelte/store'

export const modelStore = eventSourcedModelStore([])
export const modelViews = writable([] as ModelView[])
export const systemConfiguration = writable(systemConfigurationFns.empty())
export const permitModelling = writable(false)
export const showDevConsole = writable(false)
export const navbarState: Writable<string | null> = writable(null)
export const showModels = writable(true)

backendFns.setBackend(makeInMemoryBackend())
