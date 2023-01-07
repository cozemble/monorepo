import express, {Express, Router} from 'express';
import cors from 'cors';
import modelRoute from './routes/models';
import {cozembleKnex, migrateDatabase} from './knex';
import {postgraphile} from 'postgraphile';
import PgSimplifyInflectorPlugin from "@graphile-contrib/pg-simplify-inflector";
import {registerStringProperty} from "@cozemble/model-string-core";
import {registerStringPropertyEventToSqlActions} from "@cozemble/model-string-sql-actions";
import {pgUrl} from "./config";

const app: Express = express()
const cozemblePostgraphileApp: Express = express()
const appPostgraphile: Express = express()

const corsOptions = {}

app.use(cors(corsOptions))
app.use(express.json())

const routes: Router = Router()
routes.use('/model', modelRoute)

app.use('/api/v1/', [], routes)

const port: number = 3000
const cozemblePostgraphileAppPort = 3001
const appPostgraphilePort = 3002

function startsPostgraphile(app:Express,schema: string, port: number, name: string) {
    app.use(
        postgraphile(
            pgUrl,
            schema,
            {
                appendPlugins: [PgSimplifyInflectorPlugin],
                watchPg: true,
                graphiql: true,
                enhanceGraphiql: true,
            }
        )
    );
    app.listen(port, () => {
        console.log(`${name} GraphQL Endpoint - http://localhost:${port}/graphql`)
        console.log(`${name} GraphQL Console - http://localhost:${port}/graphiql`)
    })
}

async function start() {
    registerStringProperty()
    registerStringPropertyEventToSqlActions()

    console.info('Migrating database...')
    const knex = await cozembleKnex(pgUrl)
    await migrateDatabase(knex)
    console.info('Starting server...')
    app.listen(port, () => {
        console.log(`Server started on port ${port}`)
    })
    startsPostgraphile(cozemblePostgraphileApp,"cozemble", 3001, "Cozemble")
    startsPostgraphile(appPostgraphile,"app_public", 3002, "App Public")
}

start().catch(console.error)
