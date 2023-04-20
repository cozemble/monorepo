import { filledFilterInstanceGroupFns } from '@cozemble/backend-tenanted-api-types'
import { backend } from '../backend/backendStore'

export async function fetchRecords(
  tenantId: string,
  modelId: string,
  accessToken: string,
  search: string | null = null,
  filters = filledFilterInstanceGroupFns.empty(),
) {
  return backend.fetchRecords(tenantId, modelId, search, filters)
}
