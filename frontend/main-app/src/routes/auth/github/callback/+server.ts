import type { RequestEvent } from '@sveltejs/kit'
import { githubAuth, type GithubUser } from '../githubAuth'
import { establishSession } from './establishSession'
import { withAdminPgClient } from './postgresClient'

async function fetchEmail(accessToken: string, profile: any) {
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
        return establishSession(client, githubUser).then((session) => {
          return new Response(JSON.stringify(session))
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

async function fetchUserDetails(accessToken: string) {
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
    return fetchEmail(accessToken, body)
  } else {
    return new Response(JSON.stringify({ status: response.status }))
  }
}

export async function GET(event: RequestEvent) {
  const token = await githubAuth.code.getToken(event.url)
  return fetchUserDetails(token.accessToken)
}
