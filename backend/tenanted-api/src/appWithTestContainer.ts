import { exec } from 'child-process-promise'
import { PostgreSqlContainer, StartedPostgreSqlContainer } from 'testcontainers'
import { expressApp } from './expressApp'
import * as http from 'http'

function pgConnectString(container: StartedPostgreSqlContainer) {
  return `postgres://${container.getUsername()}:${container.getPassword()}@${container.getHost()}:${container.getPort()}/${container.getDatabase()}`
}

export async function appWithTestContainer(port = 3000): Promise<http.Server> {
  const container = await new PostgreSqlContainer().start()
  process.env.PGHOST = container.getHost()
  process.env.PGPORT = container.getPort().toString()
  process.env.PGDATABASE = container.getDatabase()
  process.env.PG_ADMIN_USER = container.getUsername()
  process.env.PG_ADMIN_PASSWORD = container.getPassword()

  console.log(`psql connect string = ${pgConnectString(container)}`)

  console.log('Running migrations...')
  const outcome = await exec(
    `npx postgrator --host 127.0.0.1 --database ${container.getDatabase()} --username ${container.getUsername()} --password ${container.getPassword()}`,
  )
  console.log(outcome.stdout)
  console.error('STDERR:' + outcome.stderr)
  if (outcome.stderr) {
    throw new Error(outcome.stderr)
  }
  console.log('Migrations complete.')
  const app = expressApp()
  return app.listen(port, () => {
    console.log(`Listening on port ${port}`)
  })
}
