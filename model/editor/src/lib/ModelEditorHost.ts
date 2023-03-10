import type { Model, ModelEvent, ModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'

export interface ModelChangeHandler {
  modelChanged(id: ModelId, event: ModelEvent): void
}

export interface ModelEditorHost extends ModelChangeHandler {
  modelAdded(model: Model): void

  modelWithId(allModels: EventSourcedModel[], id: ModelId): EventSourcedModel
}
