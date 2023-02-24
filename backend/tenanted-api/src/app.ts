import express, { Express, Router } from 'express'
import cors from 'cors'
import { modelRoute } from './models'
import tenants from './tenants'

export function app() {
  const app: Express = express()

  const corsOptions = {}

  app.use(cors(corsOptions))
  app.use(express.json())

  const routes: Router = Router()
  routes.use('/model', modelRoute())
  routes.use('/tenant', tenants)

  app.use('/api/v1/', [], routes)

  const port = 3000

  async function start() {
    app.listen(port, () => {
      console.log(`Server started on port ${port}`)
    })
  }
  return start
}
