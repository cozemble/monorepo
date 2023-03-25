import { uuids } from '@cozemble/lang-util'
import type { PoolClient } from 'pg'

export interface Tenant {
  tenant_id: string
  tenant_name: string
  roles: string[]
}

export interface User {
  user_id: string
  first_name: string
  email: string
  tenants: Tenant[]
}

async function getUserByEmail(
  pg: PoolClient,
  userPool: string,
  email: string,
): Promise<User | null> {
  const userSelectResult = await pg.query(
    `select *
         from get_user_by_email($1, $2)`,
    [userPool, email],
  )
  return userSelectResult.rows[0].get_user_by_email
}

async function getUserById(pg: PoolClient, userPool: string, userId: string): Promise<User | null> {
  const userSelectResult = await pg.query(
    `select *
         from get_user_by_id($1, $2)`,
    [userPool, userId],
  )
  return userSelectResult.rows[0].get_user_by_id
}

async function registerUser(
  pg: PoolClient,
  userPool: string,
  email: string,
  firstName: string,
): Promise<User> {
  const userSelectResult = await pg.query(
    `select *
         from register_user($1, $2, $3)`,
    [userPool, email, firstName],
  )
  return userSelectResult.rows[0].register_user
}

async function insertRefreshToken(
  pg: PoolClient,
  userPool: string,
  user: User,
  refreshToken: string,
) {
  await pg.query(
    `insert into refresh_token (id, user_id, user_pool, refresh_token)
         values ($1, $2, $3, $4)`,
    [uuids.v4(), user.user_id, userPool, refreshToken],
  )
}

async function inTxn<T>(client: PoolClient, action: () => Promise<T>): Promise<T> {
  await client.query('BEGIN')
  try {
    const t = await action()
    await client.query('COMMIT')
    return t
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  }
}

async function tradeRefreshTokenForUser(client: PoolClient, refreshToken: string) {
  const userSelectResult = await client.query(
    `select *
         from trade_refresh_token_for_user($1)`,
    [refreshToken],
  )
  return userSelectResult.rows[0].trade_refresh_token_for_user
}

async function tradeAuthTokenForUser(client: PoolClient, authorizationToken: string) {
  const result = await client.query(
    `select *
         from trade_auth_token_for_user($1)`,
    [authorizationToken],
  )
  return result.rows[0].trade_auth_token_for_user
}

async function createAuthToken(client: PoolClient, user: User, userPool: string): Promise<string> {
  const result = await client.query(
    `select *
         from insert_auth_token($1, text2ltree($2))`,
    [user.user_id, userPool],
  )
  return result.rows[0].insert_auth_token
}

export const db = {
  inTxn,
  users: { getUserByEmail, getUserById, registerUser },
  refreshTokens: { insertRefreshToken, tradeRefreshTokenForUser },
  authTokens: { tradeAuthTokenForUser, createAuthToken },
}
