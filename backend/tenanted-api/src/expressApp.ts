import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants'
import auth from './auth/auth'
import { logRequest } from './infra/logRequest'
import { makeStorageRoute } from './storage/storage'
import multer from 'multer'

function makeMulterMiddleware() {
  if ((process.env.USE_MEMORY_STORAGE ?? 'N').toLowerCase() === 'y') {
    const storage = multer.memoryStorage()
    return multer({ storage: storage })
  }
  throw new Error('Non-test storage yet to be implemented')
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
  const upload = makeMulterMiddleware()
  routes.use('/storage', makeStorageRoute(upload))

  app.use('/api/v1/', [], routes)

  return app
}
