import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelControls } from './ModelControls'
import type { Writable } from 'svelte/store'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { Cardinality, Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { modelIdAndNameFns, nestedModelNameFns } from '@cozemble/model-core/dist/esm'
import { coreModelEvents } from '@cozemble/model-event-sourced/dist/esm'

export function makeModelControls(
  eventSourcedModels: Writable<EventSourcedModel[]>,
): ModelControls {
  return {
    async modelEdited(model: EventSourcedModel): Promise<JustErrorMessage | null> {
      eventSourcedModels.update((models) => {
        return models.map((m) => (m.model.id.value === model.model.id.value ? model : m))
      })
      return null
    },
    async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
      eventSourcedModels.update((models) => {
        const model = eventSourcedModelFns.findById(models, modelId)
        const mutated = eventSourcedModelFns.addEvent(model, event)
        return models.map((model) => (model.model.id.value === modelId.value ? mutated : model))
      })
    },
    async addNestedModel(
      parentModel: EventSourcedModel,
      childModel: Model,
      cardinality: Cardinality,
    ): Promise<void> {
      childModel.parentModelId = parentModel.model.id
      eventSourcedModels.update((models) => {
        const newEventSourcedModel = eventSourcedModelFns.newInstance(childModel)
        return [...models, newEventSourcedModel]
      })
      const parent = modelIdAndNameFns.fromModel(parentModel.model)
      const child = modelIdAndNameFns.fromModel(childModel)
      const name =
        cardinality === 'one'
          ? nestedModelNameFns.newInstance(childModel.name.value)
          : nestedModelNameFns.newInstance(childModel.pluralName.value)
      const event = coreModelEvents.nestedModelAdded(parent, child, cardinality, name)
      await this.updateModel(parentModel.model.id, event)
    },
  }
}
