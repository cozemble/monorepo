import {Request, Response, Router} from 'express';
import {EventSourcedModel} from "@cozemble/model-event-sourced";
import {ModelEvent, ModelId} from '@cozemble/model-core';
import {arrays} from "@cozemble/lang-util";
import {modelEventToSqlActions} from "@cozemble/model-sql-actions";
import {actionToSql, schema} from '@cozemble/sql-actions';
import {appPublicKnex, cozembleKnex, SqlMigrationsKnexSource} from "../knex";
import {pgUrl} from "../config";

const router: Router = Router()

router.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        statusCode: 200,
        message: 'success'
    })
})

type ModelEventAndModelId = { event: ModelEvent, modelId: ModelId }

router.post('/apply/', async (req: Request, res: Response) => {
    const models: EventSourcedModel[] = req.body
    const events = models.flatMap(model => model.events.map(event => ({event, modelId: model.model.id})))
    const sorted = arrays.sortBy(events, (e: ModelEventAndModelId) => e.event.timestamp.value)

    const allModels = models.map(model => model.model)
    const actions = sorted.flatMap(event => {
        return modelEventToSqlActions.apply(allModels, event.modelId, event.event);
    })
    const theSchema = schema("app_public")
    const migrations = actions.map(a => actionToSql(theSchema, a))
    console.log({migrations:JSON.stringify(migrations, null, 2)})
    const knex = await appPublicKnex(pgUrl)
    const source = new SqlMigrationsKnexSource(migrations)
    await knex.migrate.latest({migrationSource: source})

    return res.status(200).send()
})

export default router