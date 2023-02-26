import type { BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { writable, type Writable } from 'svelte/store'

export const backendTenant: Writable<BackendTenant> = writable({ id: '', name: '', models: [] })
