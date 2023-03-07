import express, { Express, Router } from 'express'
import cors from 'cors'
import tenants from './tenants/tenants'
import auth from './auth/auth'
import { logRequest } from './infra/logRequest'

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

  app.use('/api/v1/', [], routes)

  return app
}
