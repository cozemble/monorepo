import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { loadTenant } from '../../../lib/tenants/tenantStore'
import { config } from '../../../lib/config'

export const load: PageLoad = async (event) => {
  if (browser) {
    const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(event.params.tenantId))
    if (!accessToken) {
      throw new Error('Failed to get accessToken')
    }
    const response = await fetch(`${config.backendUrl()}/api/v1/tenant/${event.params.tenantId}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    })
    if (response.ok) {
      const tenant = await response.json()
      loadTenant(tenant)
      return tenant
    }
    throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText ?? ''}`)
  }
}
