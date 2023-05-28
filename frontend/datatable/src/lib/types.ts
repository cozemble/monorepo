import type { EventSourcedStore } from './stores/EventSourcedStore'
import type {
  EventSourcedModelList,
  EventSourcedModelListEvent,
} from '@cozemble/model-event-sourced'

export type EventSourcedModelStore = EventSourcedStore<
  EventSourcedModelList,
  EventSourcedModelListEvent
>
