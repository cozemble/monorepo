import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { ModelEvent } from '@cozemble/model-core'

export function modelReducer(model: EventSourcedModel, action: ModelEvent): EventSourcedModel {
  return eventSourcedModelFns.addEvent(model, action)
}
