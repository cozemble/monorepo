import { GithubUser } from './githubAuth.ts'

async function fetchGithubUserEmail(accessToken: string, profile: any): Promise<GithubUser> {
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
    return { ...profile, email: primary.email }
  } else {
    throw new Error('Unable to fetch user email')
  }
}

export async function fetchGithubUserDetails(accessToken: string): Promise<GithubUser> {
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
      return body
    }
    return fetchGithubUserEmail(accessToken, body)
  } else {
    throw new Error('Unable to fetch user details')
  }
}
