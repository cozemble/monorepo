import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { EventSourcedModelGraph } from '@cozemble/model-event-sourced'

export interface ModelChangeHandler {
  modelChanged(id: ModelId, event: ModelEvent): void
}

export interface ModelEditorHost extends ModelChangeHandler {
  modelAdded(model: Model): void

  modelWithId(graph: EventSourcedModelGraph, id: ModelId): EventSourcedModel
}
