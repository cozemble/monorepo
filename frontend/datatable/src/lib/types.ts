import type { EventSourcedStore } from './stores/EventSourcedStore'
import type { TablesAction } from './tables/actions'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'

export type EventSourcedModelStore = EventSourcedStore<EventSourcedModel[], TablesAction>
