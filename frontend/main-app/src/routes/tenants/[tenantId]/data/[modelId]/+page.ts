import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../../../lib/auth/cozauth'
import { fetchTenant } from '../../fetchTenant'
import { loadTenant } from '../../../../../lib/tenants/tenantStore'
import { fetchInitialRecords } from '../../../../../lib/data/fetchInitialRecords'

export const load: PageLoad = async (event) => {
  if (browser) {
    const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(event.params.tenantId))
    if (!accessToken) {
      throw new Error('Failed to get accessToken')
    }
    const [tenantReponse, recordsResponse] = await Promise.all([
      fetchTenant(event.params.tenantId, accessToken),
      fetchInitialRecords(event.params.tenantId, event.params.modelId, accessToken),
    ])
    if (!tenantReponse.ok || !recordsResponse.ok) {
      throw new Error(`Failed to fetch tenant or records`)
    }
    const tenant = await tenantReponse.json()
    const records = await recordsResponse.json()
    loadTenant(tenant)
    return { tenant, records }
  }
}
