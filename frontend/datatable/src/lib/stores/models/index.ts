import { get, type Readable } from 'svelte/store'

import type { Model } from '@cozemble/model-core'
import { propertyDescriptors, propertyNameFns } from '@cozemble/model-core'

// TODO merge allModels store into here
import { allEventSourcedModels } from '$lib/stores/allModels'
import { systemConfiguration } from '$lib/stores/systemConfiguration'

import * as methods from './methods'

export const addSlotToModel = async (modelStore: Readable<Model>) => {
  const model = get(modelStore)

  const fieldName = `Field ${model.slots.length + 1}`

  await methods.updateModel(
    allEventSourcedModels,
    model.id,
    propertyDescriptors
      .getDefault()
      .newProperty(get(systemConfiguration), model.id, propertyNameFns.newInstance(fieldName)),
  )
}

export * as methods from './methods'
export * as contexts from './contexts'
