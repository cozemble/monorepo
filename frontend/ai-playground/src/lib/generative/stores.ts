import { eventSourcedModelStore } from '@cozemble/frontend-datatable'
import type { ModelView } from '@cozemble/model-core'
import { systemConfigurationFns } from '@cozemble/model-core'
import { writable } from 'svelte/store'
import { backendFns, makeInMemoryBackend } from '@cozemble/frontend-datatable'

export const modelStore = eventSourcedModelStore([])
export const modelViews = writable([] as ModelView[])
export const systemConfiguration = writable(systemConfigurationFns.empty())
export const permitModelling = writable(true)
export const showDevConsole = writable(false)
export const navbarState = writable('')

backendFns.setBackend(makeInMemoryBackend())
