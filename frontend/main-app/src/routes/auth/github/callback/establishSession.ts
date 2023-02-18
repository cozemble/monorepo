import { uuids } from '@cozemble/lang-util'
import type { Client } from 'pg'
import type { GithubUser } from '../githubAuth'
import jwt from 'jsonwebtoken'
import { mandatoryEnv } from '../../../../lib/util/env'

const jwtSigningSecret = mandatoryEnv('JWT_SIGNING_SECRET')

async function newSessionTokens(pg: Client, userId: string, user: GithubUser, tenant: string) {
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
    `insert into refresh_tokens (id, user_id, tenant, token)
         values ($1, $2, $3, $4)`,
    [uuids.v4(), userId, tenant, refreshToken],
  )
  return [accessToken, refreshToken]
}

export async function establishSession(pg: Client, user: GithubUser) {
  const tenant = 'root'
  let userSelectResult = await pg.query(
    `select *
         from users
         where email = $1
           and tenant = $2`,
    [user.email, tenant],
  )
  if (userSelectResult.rows.length === 0) {
    await pg.query(
      `insert into users (id, tenant, email)
             values ($1, $2, $3)`,
      [uuids.v4(), tenant, user.email],
    )
    userSelectResult = await pg.query(
      `select *
             from users
             where email = $1
               and tenant = $2`,
      [user.email, tenant],
    )
  }
  if (userSelectResult.rows.length === 0) {
    throw new Error(`Unable to create user`)
  }
  const userRow = userSelectResult.rows[0]
  return newSessionTokens(pg, userRow.id, user, tenant)
}
