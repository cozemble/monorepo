import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants.js'
import auth from './auth/auth.js'
import prompts from './analytics/prompts/prompts.js'
import { logRequest } from './infra/logRequest.js'
import { makeStorageRoute } from './storage/storage.js'
import { StorageProvider } from './storage/StorageProvider.js'
import { MemoryStorageProvider } from './storage/MemoryStorageProvider.js'
import { GoogleStorageProvider } from './storage/GoogleStorageProvider.js'
import { gcsObjects1BucketName } from './config.js'
import { makeSignedUrlsRoute } from './storage/signedUrls.js'

function makeStorageProvider(): StorageProvider {
  if ((process.env.USE_MEMORY_STORAGE ?? 'N').toLowerCase() === 'y') {
    return new MemoryStorageProvider()
  } else {
    return new GoogleStorageProvider(gcsObjects1BucketName)
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      env?: string
    }
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
  routes.use('/ai-playground', prompts)
  routes.use('/tenant', tenants)
  routes.use('/auth', auth)
  routes.use('/storage', makeStorageRoute(makeStorageProvider()))
  routes.use('/storage', makeSignedUrlsRoute(makeStorageProvider()))

  app.use(
    '/:env/api/v1/',
    (req, res, next) => {
      req.env = req.params.env
      next()
    },
    routes,
  )
  return app
}
