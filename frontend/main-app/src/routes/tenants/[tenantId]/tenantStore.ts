import type { Model, ModelEvent } from '@cozemble/model-core'
import { writable, type Writable } from 'svelte/store'

export interface BackendModelEvent {
  id: string
  height: number
  definition: ModelEvent
}

export interface BackendModel {
  id: string
  name: string
  definition: Model
  height: number
  events: BackendModelEvent[]
}

export interface BackendTenant {
  id: string
  name: string
  models: BackendModel[]
}

export const backendTenant: Writable<BackendTenant> = writable({ id: '', name: '', models: [] })
