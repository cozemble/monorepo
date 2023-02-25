import * as dotenv from 'dotenv'

export function loadEnv() {
  if (process.env.NODE_ENV !== 'production') {
    const path = `.env-${process.env.NODE_ENV}`
    console.log(`Loading environment variables from ${path}`)
    dotenv.config({ path })
  } else {
    console.log(`Loading environment variables from .env`)
    dotenv.config()
  }
}

export function mandatoryEnv(name: string) {
  const value = process.env[name]
  if (value === undefined) {
    console.error(`Environment variable ${name} is not defined`)
    throw new Error(`Environment variable ${name} is not defined`)
  }
  return value
}
