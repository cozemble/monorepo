import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'
import { cozauth } from '../auth/cozauth'
import { config } from '../config'

export async function loadReferencingRecords(
  tenantId: string,
  recordId: DataRecordId, // Customer
  referencingModelId: ModelId, // Booking
): Promise<DataRecord[]> {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const url = `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${
    referencingModelId.value
  }/referencing/${recordId.value}`
  const recordsResponse = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!recordsResponse.ok) {
    throw new Error(
      `Failed to fetch records at ${url}: ${recordsResponse.status} ${recordsResponse.statusText}`,
    )
  }
  return await recordsResponse.json()
}
