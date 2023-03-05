import { cozauth } from '../auth/cozauth'
import { fetchInitialRecords } from './fetchInitialRecords'

export async function loadInitialRecords(tenantId: string, modelId: string) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const recordsResponse = await fetchInitialRecords(tenantId, modelId, accessToken)
  if (!recordsResponse.ok) {
    throw new Error(`Failed to fetch records`)
  }
  const records = await recordsResponse.json()
  return { records }
}
