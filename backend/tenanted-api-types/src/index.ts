import { Model, ModelEvent } from '@cozemble/model-core'

export interface BackendModelEvent {
  id: string
  definition: ModelEvent
}

export interface BackendModel {
  id: string
  name: string
  definition: Model
  events: BackendModelEvent[]
}

export interface BackendTenant {
  id: string
  name: string
  models: BackendModel[]
}
