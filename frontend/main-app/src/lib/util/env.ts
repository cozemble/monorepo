export function mandatoryEnv(name: string) {
  const value = process.env[name]
  if (value === undefined) {
    console.error(`Environment variable ${name} is not defined`)
    throw new Error(`Environment variable ${name} is not defined`)
  }
  return value
}
