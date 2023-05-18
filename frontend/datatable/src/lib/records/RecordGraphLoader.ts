import type { FilterParams } from '$lib'
import type { ModelId, RecordGraph } from '@cozemble/model-core'

export type RecordGraphLoader = (
  modelId: ModelId,
  filterParams: FilterParams,
) => Promise<RecordGraph>
