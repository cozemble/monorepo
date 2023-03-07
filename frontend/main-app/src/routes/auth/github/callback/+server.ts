import { accessTokenKey, refreshTokenKey } from '@cozemble/backend-tenanted-api-types'
import type { RequestEvent } from '@sveltejs/kit'
import { githubAuth, type GithubUser } from '../githubAuth'
import { establishSession } from './establishSession'
import { withAdminPgClient } from './postgresClient'

async function fetchEmail(userPool: string, accessToken: string, profile: any) {
  const response = await fetch('https://api.github.com/user/emails', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  })
  if (response.ok) {
    const emailsBody = await response.json()
    const primary = emailsBody.find((email: any) => email.primary)
    const githubUser: GithubUser = { ...profile, email: primary.email }
    return await withAdminPgClient(async (client) => {
      try {
        return establishSession(client, userPool, githubUser).then((session) => {
          const [accessToken, refreshToken] = session
          const response = new Response('', { status: 302 })
          response.headers.set('Location', '/session/establish')
          response.headers.append(
            'Set-Cookie',
            `${accessTokenKey(userPool)}=${accessToken}; Path=/`,
          )
          response.headers.append(
            'Set-Cookie',
            `${refreshTokenKey(userPool)}=${refreshToken}; Path=/`,
          )
          return response
        })
      } catch (e: any) {
        console.error(e)
        return new Response(JSON.stringify({ status: 500 }))
      }
    })
  } else {
    return new Response(JSON.stringify({ status: response.status }))
  }
}

async function fetchUserDetails(tenant: string, accessToken: string) {
  const response = await fetch('https://api.github.com/user', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `token ${accessToken}`,
    },
  })
  if (response.ok) {
    const body = await response.json()
    if (body.email) {
      return new Response(JSON.stringify(body))
    }
    return fetchEmail(tenant, accessToken, body)
  } else {
    return new Response(JSON.stringify({ status: response.status }))
  }
}

export async function GET(event: RequestEvent) {
  const token = await githubAuth().code.getToken(event.url)
  return fetchUserDetails('root', token.accessToken)
}
