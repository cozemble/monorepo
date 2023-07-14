import { get, type Readable, type Writable } from 'svelte/store'

import type { Model, NestedModelId } from '@cozemble/model-core'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { propertyDescriptors, propertyNameFns } from '@cozemble/model-core'
import { modelFns, modelOptions, propertyFns } from '@cozemble/model-api'

// TODO merge allModels store into here
import { allEventSourcedModels } from '$lib/stores/allModels'
import { systemConfiguration } from '$lib/stores/systemConfiguration'

import * as methods from './methods'

//

export const addSlotToModel = async (modelStore: Readable<Model>) => {
  const model = get(modelStore)

  const fieldName = `Field ${model.slots.length + 1}`

  await methods.updateModel(
    allEventSourcedModels,
    model.id,
    propertyDescriptors.getDefault().newProperty(model.id, propertyNameFns.newInstance(fieldName)),
  )
}

export const addInnerTable = async (
  esModelStore: Readable<EventSourcedModel>,
  nestedModelBeingEditedStore: Writable<NestedModelId | null>,
) => {
  const esModel = get(esModelStore)

  const nestedModelId = await methods.addNestedModel(
    allEventSourcedModels,
    esModel,
    modelFns.newInstance('Inner table', modelOptions.withSlot(propertyFns.newInstance('Field 1'))),
    'many',
  )

  nestedModelBeingEditedStore.set(nestedModelId)

  return
}

export const addInnerRecord = async (
  esModelStore: Readable<EventSourcedModel>,
  nestedModelBeingEditedStore: Writable<NestedModelId | null>,
) => {
  const esModel = get(esModelStore)

  const nestedModelId = await methods.addNestedModel(
    allEventSourcedModels,
    esModel,
    modelFns.newInstance('Inner record', modelOptions.withSlot(propertyFns.newInstance('Field 1'))),
    'one',
  )

  nestedModelBeingEditedStore.set(nestedModelId)

  return
}

export const modelEdited = async (model: EventSourcedModel) =>
  await methods.modelEdited(allEventSourcedModels, model)

//

export * as methods from './methods'
export * as contexts from './contexts'
