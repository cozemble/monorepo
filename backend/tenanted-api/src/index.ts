import { loadEnv } from './loadEnv'
import { app } from './app'

loadEnv()

const start = app()

start().catch(console.error)
