import { config } from '../../../lib/config'

export async function fetchTenant(tenantId: string, accessToken: string) {
  return await fetch(`${config.backendUrl()}/api/v1/tenant/${tenantId}`, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })
}
