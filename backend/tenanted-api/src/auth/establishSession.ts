import { uuids } from '@cozemble/lang-util'
import type { PoolClient } from 'pg'
import jwt from 'jsonwebtoken'
import { mandatoryEnv } from '../infra/loadEnv.js'
import { db, User } from './db.js'
import { GithubUser } from './githubAuth.js'

export async function newSessionTokens(pg: PoolClient, env: string, user: User, userPool: string) {
  const payload = {
    iss: 'https://cozemble.com',
    tenants: user.tenants.map((t) => t.tenant_id),
    sub: user.user_id,
    firstName: user.first_name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }
  const jwtSigningSecret = mandatoryEnv('JWT_SIGNING_SECRET')

  const accessToken = jwt.sign(payload, jwtSigningSecret, {})
  const refreshToken = uuids.v4()
  await db.refreshTokens.insertRefreshToken(pg, env, userPool, user, refreshToken)
  return [accessToken, refreshToken]
}

async function createNewUser(pg: PoolClient, env: string, userPool: string, user: GithubUser) {
  const insertedUser = await db.users.registerUser(pg, env, userPool, user.email, '')
  return newSessionTokens(pg, env, insertedUser, userPool)
}

export async function establishSession(
  pg: PoolClient,
  env: string,
  userPool: string,
  githubUser: GithubUser,
) {
  return await db.inTxn(pg, async () => {
    const foundUser = await db.users.getUserByEmail(pg, env, userPool, githubUser.email)
    return foundUser
      ? newSessionTokens(pg, env, foundUser, userPool)
      : createNewUser(pg, env, userPool, githubUser)
  })
}
