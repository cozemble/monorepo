import { eventSourcedStore } from './EventSourcedStore'
import { tablesActionReducer } from '../tables/actions'
import { saveModels } from '../appBackend'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'

export const allModels = eventSourcedStore(
  tablesActionReducer,
  saveModels,
  [] as EventSourcedModel[],
)
