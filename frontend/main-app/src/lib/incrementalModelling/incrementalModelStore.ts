import { eventSourcedModelStore } from '@cozemble/frontend-datatable'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { derived } from 'svelte/store'

export const eventSourcedModels = eventSourcedModelStore([] as EventSourcedModel[])
export const models = derived(eventSourcedModels, (ms) => ms.map((m: EventSourcedModel) => m.model))
