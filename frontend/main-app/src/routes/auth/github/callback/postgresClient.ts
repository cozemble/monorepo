import pg from 'pg'
import { loadEnv, mandatoryEnv } from '../../../../lib/env/env'

loadEnv()

let adminUserClient: pg.Client | null = null

async function adminPostgresClient(): Promise<pg.Client> {
  const host = mandatoryEnv('PGHOST')
  const port = parseInt(mandatoryEnv('PGPORT'))
  const database = mandatoryEnv('PGDATABASE')
  const adminUser = mandatoryEnv('PG_ADMIN_USER')
  const adminPassword = mandatoryEnv('PG_ADMIN_PASSWORD')

  if (adminUserClient) {
    return adminUserClient
  }
  console.log(`Connecting to postgres as ${adminUser} on ${host}:${port}/${database}`)

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
