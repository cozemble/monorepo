import type { BackendTenant } from '@cozemble/backend-tenanted-api-types'
import { writable, type Writable } from 'svelte/store'
import { loadModels } from '../models/modelsStore'

export const backendTenant: Writable<BackendTenant> = writable({ id: '', name: '', models: [] })

export function loadTenant(t: BackendTenant) {
  backendTenant.set(t)
  loadModels(t.models)
}
