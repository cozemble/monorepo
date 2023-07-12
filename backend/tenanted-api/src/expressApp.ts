import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants.ts'
import auth from './auth/auth.ts'
import prompts from './analytics/prompts/prompts.ts'
import { logRequest } from './infra/logRequest.ts'
import { makeStorageRoute } from './storage/storage.ts'
import { StorageProvider } from './storage/StorageProvider.ts'
import { MemoryStorageProvider } from './storage/MemoryStorageProvider.ts'
import { GoogleStorageProvider } from './storage/GoogleStorageProvider.ts'
import { gcsObjects1BucketName } from './config.ts'
import { makeSignedUrlsRoute } from './storage/signedUrls.ts'

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
