import { cozauth } from '../auth/cozauth'
import { fetchRecords } from './fetchRecords'

export async function loadRecords(tenantId: string, modelId: string, search: string | null = null) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const recordsResponse = await fetchRecords(tenantId, modelId, accessToken, search)
  if (!recordsResponse.ok) {
    throw new Error(`Failed to fetch records`)
  }
  return await recordsResponse.json()
}
