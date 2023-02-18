import { nanoids, uuids } from '@cozemble/lang-util'
import type { Client } from 'pg'
import type { GithubUser } from '../githubAuth'
import jwt from 'jsonwebtoken'
import { mandatoryEnv } from '../../../../lib/util/env'

const jwtSigningSecret = mandatoryEnv('JWT_SIGNING_SECRET')

async function newSessionTokens(
  pg: Client,
  userId: string,
  user: GithubUser,
  tenant: string,
  userPool: string,
) {
  const options = {}
  const payload = {
    iss: 'https://cozemble.com',
    tenant,
    sub: userId,
    name: user.name,
    email: user.email,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  }
  const accessToken = jwt.sign(payload, jwtSigningSecret, options)
  const refreshToken = uuids.v4()
  await pg.query(
    `insert into refresh_token (id, user_id, user_pool, refresh_token)
         values ($1, $2, $3, $4)`,
    [uuids.v4(), userId, userPool, refreshToken],
  )
  return [accessToken, refreshToken]
}

async function createNewUser(pg: Client, userPool: string, user: GithubUser) {
  const userId = uuids.v4()
  const tenantId = `${userPool}.tenants.${nanoids.alpha()}`
  await pg.query(
    `insert into tenant (id, name)
         values ($1, $2)`,
    [tenantId, 'Default Tenant'],
  )
  await pg.query(
    `insert into users (id, user_pool, email, tenant)
         values ($1, $2, $3, $4)`,
    [userId, userPool, user.email, tenantId],
  )
  return newSessionTokens(pg, userId, user, tenantId, userPool)
}

export async function establishSession(pg: Client, userPool: string, user: GithubUser) {
  try {
    await pg.query('BEGIN')
    const userSelectResult = await pg.query(
      `select *
             from users
             where email = $1
               and user_pool = $2`,
      [user.email, userPool],
    )
    if (userSelectResult.rows.length === 0) {
      return createNewUser(pg, userPool, user)
    }
    const userRow = userSelectResult.rows[0]
    return newSessionTokens(pg, userRow.id, user, userRow.tenant, userPool)
  } catch (e: any) {
    console.error(e)
    await pg.query('ROLLBACK')
    throw e
  } finally {
    await pg.query('COMMIT')
  }
}
