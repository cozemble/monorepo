import type { AccessTokenProvider, BackendUrlProvider } from '@cozemble/frontend-bff'
import { cozauth } from '../auth/cozauth'
import { config } from '../config'

async function accessToken(tenantId: string) {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error(`No access token for tenant ${tenantId}`)
  }

  return accessToken
}

export const accessTokenProvider: AccessTokenProvider = accessToken
export const backendUrlProvider: BackendUrlProvider = () => config.backendUrl()
