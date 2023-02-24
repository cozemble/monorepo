import express, { Express, Router } from 'express'
import cors from 'cors'
import rootRoute from './rootRoute'
import tenants from './tenants'
import * as dotenv from 'dotenv'
dotenv.config()

const app: Express = express()

const corsOptions = {}

app.use(cors(corsOptions))
app.use(express.json())

const routes: Router = Router()
routes.use('/model', rootRoute)
routes.use('/tenant', tenants)

app.use('/api/v1/', [], routes)

const port = 3000

async function start() {
  app.listen(port, () => {
    console.log(`Server started on port ${port}`)
  })
}

start().catch(console.error)
