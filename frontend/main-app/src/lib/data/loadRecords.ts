import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'
import { filledFilterInstanceGroupFns } from '@cozemble/backend-tenanted-api-types'
import { backend } from '../backend/backendStore'

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
): Promise<DataRecord | null> {
  return backend.findRecordById(tenantId, modelId, recordId)
}
