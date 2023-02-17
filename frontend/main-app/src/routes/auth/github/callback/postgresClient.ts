import * as dotenv from 'dotenv'
import pg from 'pg'
import { mandatoryEnv } from '../../../../lib/util/env'

dotenv.config()

let adminUserClient: pg.Client | null = null

const host = mandatoryEnv('POSTGRES_HOST')
const port = parseInt(mandatoryEnv('POSTGRES_PORT'))
const database = mandatoryEnv('POSTGRES_DATABASE')
const adminUser = mandatoryEnv('POSTGRES_ADMIN_USER')
const adminPassword = mandatoryEnv('POSTGRES_ADMIN_PASSWORD')

async function adminPostgresClient(): Promise<pg.Client> {
  if (adminUserClient) {
    return adminUserClient
  }
  adminUserClient = new pg.Client({
    host,
    port,
    database,
    user: adminUser,
    password: adminPassword,
  })
  await adminUserClient.connect()
  return adminUserClient
}

export async function withAdminPgClient<T>(f: (client: pg.Client) => Promise<T>): Promise<T> {
  const client = await adminPostgresClient()
  try {
    return await f(client)
  } finally {
    // await client.end()
  }
}
