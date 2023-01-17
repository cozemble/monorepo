const requiredServerEnvs = ['NODE_ENV', 'POSTGRESQL_DATABASE_URL'] as const

type RequiredServerEnvKeys = (typeof requiredServerEnvs)[number]

declare global {
  namespace NodeJS {
    type ProcessEnv = Record<RequiredServerEnvKeys, string>
  }
}

export {}
