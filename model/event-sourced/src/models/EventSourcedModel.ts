import type { Model, ModelEvent } from '@cozemble/model-core'

export interface EventSourcedModel {
  _type: 'event.sourced.model'
  model: Model
  events: ModelEvent[]
}

export interface EventSourcedModelList {
  _type: 'event.sourced.model.list'
  models: EventSourcedModel[]
}
