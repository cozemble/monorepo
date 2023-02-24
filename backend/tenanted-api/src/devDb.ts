import { exec } from 'child_process'
import { PostgreSqlContainer } from 'testcontainers'
import { app } from './app'

async function start() {
  const container = await new PostgreSqlContainer().start()
  process.env.PGHOST = container.getHost()
  process.env.PGPORT = container.getPort().toString()
  process.env.PGDATABASE = container.getDatabase()
  process.env.PG_ADMIN_USER = container.getUsername()
  process.env.PG_ADMIN_PASSWORD = container.getPassword()

  exec(
    `npx postgrator --host 127.0.0.1 --database ${container.getDatabase()} --username ${container.getUsername()} --password ${container.getPassword()}`,
    (error, stdout, stderr) => {
      console.log(stdout)
      console.log(stderr)
      if (error !== null) {
        console.log(`exec error: ${error}`)
      }
    },
  )
  const appStart = app()
  appStart().catch(console.error)
}

start().catch(console.error)
