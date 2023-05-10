import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { ModelEvent, ModelId } from '@cozemble/model-core'
import type { Cardinality, Model } from '@cozemble/model-core'
import type { NestedModelId } from '@cozemble/model-core'

export interface ModelControls {
  modelEdited(model: EventSourcedModel): Promise<JustErrorMessage | null>

  updateModel(modelId: ModelId, event: ModelEvent): Promise<void>

  addNestedModel(
    parent: EventSourcedModel,
    child: Model,
    cardinality: Cardinality,
  ): Promise<NestedModelId>
}
