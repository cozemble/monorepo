import express, { Express, Router } from 'express'
import cors from 'cors'
import { modelRoute } from './models'
import tenants from './tenants'

export function expressApp(): Express {
  const app: Express = express()

  const corsOptions = {}

  app.use(cors(corsOptions))
  app.use(express.json())

  const routes: Router = Router()
  routes.use('/model', modelRoute())
  routes.use('/tenant', tenants)

  app.use('/api/v1/', [], routes)

  return app
}
