import type { FilterParams } from '$lib'
import type { ModelId } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'

export type RecordGraphLoader = (
  modelId: ModelId,
  filterParams: FilterParams,
) => Promise<EventSourcedRecordGraph>
