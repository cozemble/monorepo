import type { DataRecordId, ModelId } from '@cozemble/model-core'
import { filledFilterInstanceGroupFns } from '@cozemble/backend-tenanted-api-types'
import { backend } from '../backend/backendStore'
import type { RecordAndEdges } from '@cozemble/model-core'

export async function loadRecords(
  tenantId: string,
  modelId: string,
  search: string | null = null,
  filters = filledFilterInstanceGroupFns.empty(),
) {
  return backend.fetchRecords(tenantId, modelId, search, filters)
}

export async function findRecordById(
  tenantId: string,
  modelId: ModelId,
  recordId: DataRecordId,
): Promise<RecordAndEdges | null> {
  return backend.findRecordById(tenantId, modelId, recordId)
}
