import { uuids } from '@cozemble/lang-util'
import type { Client } from 'pg'

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

async function getUserByEmail(pg: Client, userPool: string, email: string): Promise<User | null> {
  const userSelectResult = await pg.query(
    `select *
       from get_user_by_email($1, $2)`,
    [userPool, email],
  )
  return userSelectResult.rows[0].get_user_by_email
}

async function getUserById(pg: Client, userPool: string, userId: string): Promise<User | null> {
  const userSelectResult = await pg.query(
    `select *
       from get_user_by_id($1, $2)`,
    [userPool, userId],
  )
  return userSelectResult.rows[0].get_user_by_id
}

async function registerUser(
  pg: Client,
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

async function insertRefreshToken(pg: Client, userPool: string, user: User, refreshToken: string) {
  await pg.query(
    `insert into refresh_token (id, user_id, user_pool, refresh_token)
       values ($1, $2, $3, $4)`,
    [uuids.v4(), user.user_id, userPool, refreshToken],
  )
}

async function inTxn<T>(client: Client, action: () => Promise<T>): Promise<T> {
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

export const db = {
  inTxn,
  users: { getUserByEmail, getUserById, registerUser },
  refreshTokens: { insertRefreshToken },
}