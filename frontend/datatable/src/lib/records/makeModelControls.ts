import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelControls } from './ModelControls'
import type { Writable } from 'svelte/store'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { Cardinality, Model, ModelEvent, ModelId } from '@cozemble/model-core'
import { modelIdAndNameFns, nestedModelNameFns } from '@cozemble/model-core'
import { coreModelEvents } from '@cozemble/model-event-sourced'
import type { NestedModelId } from '@cozemble/model-core'
import { nestedModelIdFns } from '@cozemble/model-core'
import type { EventSourcedModelList } from '@cozemble/model-event-sourced'

export function makeModelControls(modelList: Writable<EventSourcedModelList>): ModelControls {
  return {
    async modelEdited(model: EventSourcedModel): Promise<JustErrorMessage | null> {
      console.log({ model })
      modelList.update((list) => {
        const mutatedModels = list.models.map((m) =>
          m.model.id.value === model.model.id.value ? model : m,
        )
        return { ...list, models: mutatedModels }
      })
      return null
    },
    async updateModel(modelId: ModelId, event: ModelEvent): Promise<void> {
      modelList.update((list) => {
        const model = eventSourcedModelFns.findById(list.models, modelId)
        const mutated = eventSourcedModelFns.addEvent(model, event)
        const mutatedModels = list.models.map((model) =>
          model.model.id.value === modelId.value ? mutated : model,
        )
        return { ...list, models: mutatedModels }
      })
    },
    async addNestedModel(
      parentModel: EventSourcedModel,
      childModel: Model,
      cardinality: Cardinality,
    ): Promise<NestedModelId> {
      childModel.parentModelId = parentModel.model.id
      modelList.update((list) => {
        const newEventSourcedModel = eventSourcedModelFns.newInstance(childModel)
        return { ...list, models: [...list.models, newEventSourcedModel] }
      })
      const parent = modelIdAndNameFns.fromModel(parentModel.model)
      const child = modelIdAndNameFns.fromModel(childModel)
      const name =
        cardinality === 'one'
          ? nestedModelNameFns.newInstance(childModel.name.value)
          : nestedModelNameFns.newInstance(childModel.pluralName.value)
      const nestedModelId = nestedModelIdFns.newInstance()
      const event = coreModelEvents.nestedModelAdded(
        parent,
        child,
        cardinality,
        name,
        nestedModelId,
      )
      await this.updateModel(parentModel.model.id, event)
      return nestedModelId
    },
  }
}
