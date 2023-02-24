import type { RequestEvent } from '@sveltejs/kit'
import { accessTokenKey, refreshTokenKey } from '../../../../lib/auth/cozauth'
import { establishSession } from '../../github/callback/establishSession'
import { withAdminPgClient } from '../../github/callback/postgresClient'
import type { GithubUser, SignInState } from '../../github/githubAuth'
import { fromUrlFriendly, githubAuth } from '../../github/githubAuth'

async function getTokens(userPool: string, githubUser: GithubUser) {
  return await withAdminPgClient(async (client) => {
    try {
      return establishSession(client, userPool, githubUser).then((session) => {
        const [accessToken, refreshToken] = session
        const response = new Response('', { status: 302 })
        response.headers.set('Location', '/session/establish')
        response.headers.append('Set-Cookie', `${accessTokenKey(userPool)}=${accessToken}; Path=/`)
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
}

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
    return await getTokens(userPool, githubUser)
  } else {
    return new Response(JSON.stringify({ status: response.status }))
  }
}

async function fetchUserDetails(userPool: string, accessToken: string) {
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
      return await getTokens(userPool, body)
    }
    return fetchEmail(userPool, accessToken, body)
  } else {
    return new Response(JSON.stringify({ status: response.status }))
  }
}

export async function GET(event: RequestEvent) {
  const state = event.url.searchParams.get('state')
  if (!state) {
    return new Response(`No state provided in callback url`, { status: 400 })
  }
  const token = await githubAuth().code.getToken(event.url)
  const signinState = fromUrlFriendly<SignInState>(state)
  if (signinState._type !== 'cozauth.signin.state') {
    return new Response(`State is not of type cozauth.signin.state`, { status: 400 })
  }
  if (signinState.provider !== 'github') {
    return new Response(`State is not for github`, { status: 400 })
  }
  return fetchUserDetails(signinState.userPool, token.accessToken)
}
