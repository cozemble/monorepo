import { uuids } from '@cozemble/lang-util'
import type { PoolClient } from 'pg'
import jwt from 'jsonwebtoken'
import { mandatoryEnv } from '../infra/loadEnv'
import { db, User } from './db'
import { GithubUser } from './githubAuth'

export async function newSessionTokens(pg: PoolClient, user: User, userPool: string) {
  const payload = {
    iss: 'https://cozemble.com',
    tenants: user.tenants.map((t) => t.tenant_id),
    sub: user.user_id,
    firstName: user.first_name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }
  console.log({ payload, date: new Date() })
  const jwtSigningSecret = mandatoryEnv('JWT_SIGNING_SECRET')

  const accessToken = jwt.sign(payload, jwtSigningSecret, {})
  const refreshToken = uuids.v4()
  await db.refreshTokens.insertRefreshToken(pg, userPool, user, refreshToken)
  return [accessToken, refreshToken]
}

async function createNewUser(pg: PoolClient, userPool: string, user: GithubUser) {
  const insertedUser = await db.users.registerUser(pg, userPool, user.email, '')
  return newSessionTokens(pg, insertedUser, userPool)
}

export async function establishSession(pg: PoolClient, userPool: string, githubUser: GithubUser) {
  return await db.inTxn(pg, async () => {
    const foundUser = await db.users.getUserByEmail(pg, userPool, githubUser.email)
    return foundUser
      ? newSessionTokens(pg, foundUser, userPool)
      : createNewUser(pg, userPool, githubUser)
  })
}
