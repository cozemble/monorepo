import ClientOAuth2 from 'client-oauth2'
import { mandatory } from '@cozemble/lang-util'
import { loadEnv } from '../../../lib/env/env'

loadEnv()

export interface GithubUser {
  _type: 'cozauth.github.user'
  login: string
  id: number
  name: string
  email: string
}

export interface SignInState {
  _type: 'cozauth.signin.state'
  userPool: string
  provider: 'github'
}

export function signInState(userPool: string, provider: 'github'): SignInState {
  return {
    _type: 'cozauth.signin.state',
    userPool,
    provider,
  }
}

export function toUrlFriendly(obj: any) {
  return btoa(JSON.stringify(obj))
}

export function fromUrlFriendly<T>(str: string): T {
  return JSON.parse(atob(str))
}

export const githubAuth = (): ClientOAuth2 => {
  const authRoot = mandatory(process.env.OAUTH_CALLBACK_ROOT, `No OAUTH_CALLBACK_ROOT env var set`)

  return new ClientOAuth2({
    clientId: mandatory(process.env.GITHUB_CLIENT_ID, `No GITHUB_CLIENT_ID env var set`),
    clientSecret: mandatory(
      process.env.GITHUB_CLIENT_SECRET,
      `No GITHUB_CLIENT_SECRET env var set`,
    ),
    accessTokenUri: 'https://github.com/login/oauth/access_token',
    authorizationUri: 'https://github.com/login/oauth/authorize',
    redirectUri: `${authRoot}/auth/v1/callback`,
    scopes: ['user:email'],
  })
}
