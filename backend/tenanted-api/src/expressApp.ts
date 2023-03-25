import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants'
import auth from './auth/auth'
import { logRequest } from './infra/logRequest'
import { makeStorageRoute } from './storage/storage'
import multer, { StorageEngine } from 'multer'
import { makeMulterGoogleStorage } from './google/makeMulterGoogleStorage'
import { uuids } from '@cozemble/lang-util'

function makeMulterMiddleware() {
  if ((process.env.USE_MEMORY_STORAGE ?? 'N').toLowerCase() === 'y') {
    const storage = multer.memoryStorage()
    const extendedStorage: StorageEngine = {
      _handleFile(
        req: express.Request,
        file: Express.Multer.File,
        callback: (error?: any, info?: Partial<Express.Multer.File>) => void,
      ): void {
        ;(file as any).fileId = uuids.v4()
        ;(file as any).storageProvider = 'memory'
        ;(file as any).storageDetails = { bucket: 'memory' }
        storage._handleFile(req, file, callback)
      },
      _removeFile(
        req: express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null) => void,
      ): void {
        storage._removeFile(req, file, callback)
      },
    }
    return multer({ storage: extendedStorage })
  }
  return makeMulterGoogleStorage()
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
  routes.use('/storage', makeStorageRoute(makeMulterMiddleware()))

  app.use('/api/v1/', [], routes)

  return app
}
