import { cozauth } from '../auth/cozauth'
import { fetchTenant } from '../../routes/tenants/[tenantId]/fetchTenant'
import { loadTenant } from '../tenants/tenantStore'
import { fetchInitialRecords } from './fetchInitialRecords'

export async function loadInitialRecords(tenantId: string, modelId: string) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const [tenantReponse, recordsResponse] = await Promise.all([
    fetchTenant(tenantId, accessToken),
    fetchInitialRecords(tenantId, modelId, accessToken),
  ])
  if (!tenantReponse.ok || !recordsResponse.ok) {
    throw new Error(`Failed to fetch tenant or records`)
  }
  const tenant = await tenantReponse.json()
  const records = await recordsResponse.json()
  loadTenant(tenant)
  return { tenant, records }
}
