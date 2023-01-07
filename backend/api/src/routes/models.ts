import {Request, Response, Router} from 'express';
import {EventSourcedModel} from "@cozemble/model-event-sourced";
import {ModelEvent, ModelId} from '@cozemble/model-core';
import {arrays} from "@cozemble/lang-util";
import {modelEventToSqlActions} from "@cozemble/model-sql-actions";
import {actionToSql, schema} from '@cozemble/sql-actions';
import {appPublicKnex, ModelEventTableRow, ModelTableRow, SqlMigrationsKnexSource} from "../knex";
import {pgUrl} from "../config";

const router: Router = Router()

router.get('/', (req: Request, res: Response) => {
    return res.status(200).json({
        statusCode: 200,
        message: 'success'
    })
})

type ModelEventAndModelId = { event: ModelEvent, modelId: ModelId }

function asModelTableRow(e: EventSourcedModel): ModelTableRow {
    return {
        model_id: e.model.id.id,
        name: e.model.name.value,
        definition: JSON.stringify(e.model),
        created_at: new Date(),
        updated_at: new Date()
    }
}

function asModelEventTableRow(e: ModelEventAndModelId): ModelEventTableRow {
    return {
        model_event_id: e.event.id.value,
        model_id: e.modelId.id,
        definition: JSON.stringify(e.event),
        created_at: new Date(),
        updated_at: new Date()
    }
}

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
    const knex = await appPublicKnex(pgUrl)
    const source = new SqlMigrationsKnexSource(migrations)
    try {
        await knex.migrate.latest({migrationSource: source})
    } catch (e: any) {
        console.error(e)
        return res.status(500).json({
            statusCode: 500,
            message: e.message
        })
    }

    const modelTableRows = models.map(asModelTableRow)
    const modelEventRows = sorted.flatMap(asModelEventTableRow)
    try {
        knex.transaction(async function (trx) {
            await trx('cozemble.models').insert(modelTableRows).onConflict('model_id').merge()
            await trx('cozemble.model_events').insert(modelEventRows).onConflict('model_event_id').ignore()
            return res.status(200).send()
        })
    } catch (e:any) {
        console.error(e)
        return res.status(500).json({
            statusCode: 500,
            message: e.message
        })
    }
})

export default router