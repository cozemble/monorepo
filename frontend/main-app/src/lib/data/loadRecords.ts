import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'
import { cozauth } from '../auth/cozauth'
import { fetchRecords } from './fetchRecords'
import { config } from '../config'
import { filledFilterInstanceGroupFns } from '@cozemble/backend-tenanted-api-types'

export async function loadRecords(
  tenantId: string,
  modelId: string,
  search: string | null = null,
  filters = filledFilterInstanceGroupFns.empty(),
) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const recordsResponse = await fetchRecords(tenantId, modelId, accessToken, search, filters)
  if (!recordsResponse.ok) {
    throw new Error(`Failed to fetch records`)
  }
  return await recordsResponse.json()
}

export async function findRecordById(
  tenantId: string,
  modelId: ModelId,
  recordId: DataRecordId,
): Promise<DataRecord | null> {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const recordsResponse = await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId.value}/record/${
      recordId.value
    }`,
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )

  if (!recordsResponse.ok) {
    throw new Error(`Failed to fetch records`)
  }
  return await recordsResponse.json()
}
