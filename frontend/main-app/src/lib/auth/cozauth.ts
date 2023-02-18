export interface Session {
  _type: 'cozauth.session'
  user: {
    id: string
    email: string
    firstName: string
  }
}

function session(userId: string, email: string, firstName: string): Session {
  return {
    _type: 'cozauth.session',
    user: {
      id: userId,
      email,
      firstName,
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

export function accessTokenKey(userPool: string) {
  return `cozauth.accessToken.${userPool}`
}

export function refreshTokenKey(userPool: string) {
  return `cozauth.refreshToken.${userPool}`
}

export const cozauth = {
  setTokens: (tenant: string, accessToken: string, refreshToken: string) => {
    localStorage.setItem(accessTokenKey(tenant), accessToken)
    localStorage.setItem(refreshTokenKey(tenant), refreshToken)
  },
  getSession: async (tenant: string): Promise<Session | null> => {
    const accessToken = localStorage.getItem(accessTokenKey(tenant))
    if (accessToken) {
      const jwtPayload = parseJwt(accessToken)
      console.log({ jwtPayload })
      return session(jwtPayload.sub, jwtPayload.email, jwtPayload.email)
    }

    return null
  },
}
