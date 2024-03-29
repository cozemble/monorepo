import { arrays } from '@cozemble/lang-util'
import type { ModelEvent, ModelId } from '@cozemble/model-core'
import { derived } from 'svelte/store'
import { modelList } from './host'

type ModelEventAndModelId = { event: ModelEvent; modelId: ModelId }

export const events = derived(modelList, (list) => {
  const modelEvents = list.models.flatMap((model) =>
    model.events.map((event) => ({ event, modelId: model.model.id })),
  )
  return arrays.sortBy(modelEvents, (e: ModelEventAndModelId) => e.event.timestamp.value)
})

export const eventTypes = derived(events, (events) => {
  return events.map((e) => e.event._type)
})
