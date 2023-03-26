import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants'
import auth from './auth/auth'
import { logRequest } from './infra/logRequest'
import { makeStorageRoute } from './storage/storage'
import { StorageProvider } from './storage/StorageProvider'
import { MemoryStorageProvider } from './storage/MemoryStorageProvider'
import { GoogleStorageProvider } from './storage/GoogleStorageProvider'
import { gcsObjects1BucketName } from './config'
import { makeSignedUrlsRoute } from './storage/signedUrls'

function makeStorageProvider(): StorageProvider {
  if ((process.env.USE_MEMORY_STORAGE ?? 'N').toLowerCase() === 'y') {
    return new MemoryStorageProvider()
  } else {
    return new GoogleStorageProvider(gcsObjects1BucketName)
  }
}

export function expressApp(): Express {
  const app: Express = express()

  const corsOptions = {}

  app.use(cors(corsOptions))
  app.use(express.json())

  app.use((req, res, next) => {
    logRequest(req)
    next()
  })

  const routes: Router = Router()
  routes.use('/tenant', tenants)
  routes.use('/auth', auth)
  routes.use('/storage', makeStorageRoute(makeStorageProvider()))
  routes.use('/storage', makeSignedUrlsRoute(makeStorageProvider()))

  app.use('/api/v1/', [], routes)

  return app
}
