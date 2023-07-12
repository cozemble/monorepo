import { accessTokenKey, refreshTokenKey } from '@cozemble/backend-tenanted-api-types'
import { tradeRefreshTokenForAccessToken } from './tradeRefreshTokenForAccessToken.ts'

export interface Session {
  _type: 'cozauth.session'
  user: {
    id: string
    email: string
    firstName: string
    tenants: string[]
  }
}

function session(userId: string, email: string, firstName: string, tenants: string[]): Session {
  return {
    _type: 'cozauth.session',
    user: {
      id: userId,
      email,
      firstName,
      tenants,
    },
  }
}

function parseJwt(token: string) {
  const base64Url = token.split('.')[1]
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      })
      .join(''),
  )

  return JSON.parse(jsonPayload)
}

async function refreshAccessToken(userPool: string): Promise<string | null> {
  const localRefreshToken = localStorage.getItem(refreshTokenKey(userPool))
  if (!localRefreshToken) {
    console.warn(`No refresh token found for user pool ${userPool}`)
    return null
  }
  const { accessToken, refreshToken } = await tradeRefreshTokenForAccessToken(
    userPool,
    localRefreshToken,
  )
  cozauth.setTokens(userPool, accessToken, refreshToken)
  return accessToken
}

function isExpiring(accessToken: string) {
  const jwt = parseJwt(accessToken)
  const now = new Date()
  const exp = new Date(jwt.exp * 1000)
  const diff = exp.getTime() - now.getTime()
  if (diff <= 1000 * 60 * 5) {
    console.warn('Access token is expiring soon', { diff, exp, now })
    return true
  }
  return false
}

export const cozauth = {
  setTokens: (userPool: string, accessToken: string, refreshToken: string) => {
    localStorage.setItem(accessTokenKey(userPool), accessToken)
    localStorage.setItem(refreshTokenKey(userPool), refreshToken)
  },
  getTenantRoot: (tenantLtree: string) => {
    const parts = tenantLtree.split('.')
    if (parts.length !== 3) {
      throw new Error(`To do: deal with nested tenants. Tenant ltree is: ${tenantLtree}`)
    }
    return 'root'
  },
  getSession: async (userPool: string): Promise<Session | null> => {
    const accessToken = await cozauth.getAccessToken(userPool)
    if (accessToken) {
      const jwtPayload = parseJwt(accessToken)
      return session(jwtPayload.sub, jwtPayload.email, jwtPayload.email, jwtPayload.tenants)
    }

    return null
  },
  getAccessToken: async (userPool: string): Promise<string | null> => {
    const accessToken = localStorage.getItem(accessTokenKey(userPool))
    if (!accessToken) {
      console.warn(`No access token found for user pool ${userPool}`)
      return null
    }
    if (isExpiring(accessToken)) {
      try {
        return await refreshAccessToken(userPool)
      } catch (e) {
        console.error('Failed to refresh access token', e)
        localStorage.removeItem(accessTokenKey(userPool))
        localStorage.removeItem(refreshTokenKey(userPool))
        window.location.href = '/'
      }
    }
    return accessToken
  },
  clearTokens: (userPool: string) => {
    localStorage.removeItem(accessTokenKey(userPool))
    localStorage.removeItem(refreshTokenKey(userPool))
  },
}
