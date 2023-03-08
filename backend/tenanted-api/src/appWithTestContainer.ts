import { exec } from 'child-process-promise'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers'
import { expressApp } from './expressApp'
import * as http from 'http'
import { closePgPool, withAdminPgClient } from './infra/postgresPool'

function pgConnectString(container: StartedPostgreSqlContainer) {
  return `postgres://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`
}

export interface PgDetails {
  host: string
  port: string
  database: string
  username: string
  password: string
}

async function createAppUser() {
  try {
    return withAdminPgClient(async (client) => {
      await client.query(`
        CREATE USER app_user WITH PASSWORD 'password';
        GRANT ALL PRIVILEGES ON DATABASE postgres TO app_user;
        GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO app_user;
      `)
    })
  } catch (e) {
    console.error('Failed to create app_user', e)
  }
}

export async function appWithTestContainer(
  jwtSigningKey = 'secret',
  port = 3000,
  pgDetails?: PgDetails,
): Promise<http.Server> {
  const container = await new PostgreSqlContainer().start()
  process.env.PGHOST = pgDetails?.host ?? container.getHost()
  process.env.PGPORT = pgDetails?.port ?? container.getPort().toString()
  process.env.PGDATABASE = pgDetails?.database ?? container.getDatabase()
  process.env.PG_ADMIN_USER = pgDetails?.username ?? container.getUsername()
  process.env.PG_ADMIN_PASSWORD = pgDetails?.password ?? container.getPassword()
  process.env.JWT_SIGNING_SECRET = jwtSigningKey
  process.env.OAUTH_CALLBACK_ROOT = `http://localhost:${port}/api/v1/auth/callback`
  process.env.GITHUB_CLIENT_ID = 'pretend-github-client-id'
  process.env.GITHUB_CLIENT_SECRET = 'pretend-github-client-secret'

  if (!pgDetails) {
    console.log('Running migrations...')
    const outcome = await exec(
      `npx postgrator --host 127.0.0.1 --database ${container.getDatabase()} --username ${container.getUsername()} --password ${container.getPassword()}`,
    )
    console.log(outcome.stdout)
    console.error('STDERR:' + outcome.stderr)
    if (outcome.stderr) {
      throw new Error(outcome.stderr)
    }

    await createAppUser()
    await closePgPool()
    process.env.PG_ADMIN_USER = 'app_user'
    process.env.PG_ADMIN_PASSWORD = 'password'
    console.log('Migrations complete.')

    console.log(`psql connect string = ${pgConnectString(container)}`)
  }
  const app = expressApp()
  return app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}
