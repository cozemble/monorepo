import type { EventSourcedStore } from './stores/EventSourcedStore'
import type { TablesAction } from './tables/actions'
import type { Model } from '@cozemble/model-core'

export type EventSourcedModelStore = EventSourcedStore<Model[], TablesAction>
