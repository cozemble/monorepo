import knex, { Knex } from 'knex'
import { type SqlMigration, sqlMigration } from '@cozemble/sql-actions'

export async function cozembleKnex(connectionString: string): Promise<Knex> {
  const result = knex({
    asyncStackTraces: true,
    client: 'pg',
    connection: { connectionString, ssl: false },
    migrations: { tableName: 'cozemble_knex_migrations' },
  })
  await result.raw('SELECT 1 + 1 AS result')
  return result
}

export async function appPublicKnex(connectionString: string): Promise<Knex> {
  const result = knex({
    asyncStackTraces: true,
    client: 'pg',
    connection: { connectionString, ssl: false },
    migrations: { tableName: 'app_public_knex_migrations' },
  })
  await result.raw('SELECT 1 + 1 AS result')
  return result
}

export class SqlMigrationsKnexSource {
  constructor(private readonly migrations: SqlMigration[]) {}

  async getMigrations(): Promise<string[]> {
    return this.migrations.map((m, index) => `migration-${index}`)
  }

  getMigrationName(migration: string): string {
    return migration
  }

  getMigration(migration: string): Promise<Knex.Migration> {
    const sqlMigration = this.migrations.find((m, index) => `migration-${index}` === migration)
    if (!sqlMigration) {
      throw new Error(`Did not find migration with name ${migration}`)
    }
    return Promise.resolve({
      async up(knex: Knex) {
        const lines = sqlMigration.up.join('\n')
        await knex.schema.raw(lines)
      },
      async down(knex: Knex) {
        const lines = sqlMigration.down.join('\n')
        await knex.schema.raw(lines)
      },
    })
  }
}

export async function migrateDatabase(knex: Knex) {
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS cozemble`)
  await knex.raw(`CREATE SCHEMA IF NOT EXISTS app_public`)
  const source = new SqlMigrationsKnexSource(migrations())
  await knex.migrate.latest({ migrationSource: source })
}

function migrations(): SqlMigration[] {
  return [initialModelsTable(), initialModelEventsTable()]
}

function initialModelsTable(): SqlMigration {
  const up = `CREATE TABLE cozemble.models
                (
                    ID         SERIAL PRIMARY KEY,
                    name       VARCHAR(255) NOT NULL,
                    model_id   VARCHAR(255) NOT NULL,
                    definition JSONB        NOT NULL,
                    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
                )`
  const down = `DROP TABLE cozemble.models`
  return sqlMigration([up], [down])
}

function initialModelEventsTable(): SqlMigration {
  const up = `CREATE TABLE cozemble.model_events
                (
                    ID         SERIAL PRIMARY KEY,
                    model_id   VARCHAR(255) NOT NULL,
                    definition JSONB        NOT NULL,
                    created_at TIMESTAMP    NOT NULL DEFAULT NOW(),
                    updated_at TIMESTAMP    NOT NULL DEFAULT NOW()
                )`
  const down = `DROP TABLE cozemble.model_events`
  return sqlMigration([up], [down])
}
