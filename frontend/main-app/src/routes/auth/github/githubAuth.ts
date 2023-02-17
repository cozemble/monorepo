import * as dotenv from 'dotenv'
dotenv.config()
import ClientOAuth2 from 'client-oauth2'
import { mandatory } from '@cozemble/lang-util'

const authRoot = mandatory(process.env.OAUTH_CALLBACK_ROOT, `No OAUTH_CALLBACK_ROOT env var set`)

export interface GithubUser {
  _type: 'cozauth.github.user'
  login: string
  id: number
  name: string
  email: string
}

export const githubAuth = new ClientOAuth2({
  clientId: mandatory(process.env.GITHUB_CLIENT_ID, `No GITHUB_CLIENT_ID env var set`),
  clientSecret: mandatory(process.env.GITHUB_CLIENT_SECRET, `No GITHUB_CLIENT_SECRET env var set`),
  accessTokenUri: 'https://github.com/login/oauth/access_token',
  authorizationUri: 'https://github.com/login/oauth/authorize',
  redirectUri: `${authRoot}/auth/github/callback`,
  scopes: ['user:email'],
})
