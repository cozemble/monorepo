import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { loadTenant } from '../../../lib/tenants/tenantStore'
import { fetchTenant } from './fetchTenant'

export const load: PageLoad = async (event) => {
  if (browser) {
    const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(event.params.tenantId))
    if (!accessToken) {
      throw new Error('Failed to get accessToken')
    }
    const response = await fetchTenant(event.params.tenantId, accessToken)
    if (response.ok) {
      const tenant = await response.json()
      loadTenant(tenant)
      return tenant
    }
    throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText ?? ''}`)
  }
}
