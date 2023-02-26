import type { PageLoad } from './$types'
import { browser } from '$app/environment'
import { cozauth } from '../../../lib/auth/cozauth'
import { backendTenant } from './tenantStore'

export const load: PageLoad = async (event) => {
  if (browser) {
    const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(event.params.tenantId))
    if (!accessToken) {
      throw new Error('Failed to get accessToken')
    }
    const response = await fetch(
      `https://backend-tenanted-api-qwquwvrytq-nw.a.run.app/api/v1/tenant/${event.params.tenantId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      },
    )
    if (response.ok) {
      const tenant = await response.json()
      backendTenant.set(tenant)
      return tenant
    }
    throw new Error(`Failed to fetch tenant: ${response.status} ${response.statusText ?? ''}`)
  }
}
