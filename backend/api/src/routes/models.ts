import { Request, Response, Router } from 'express'
import { type EventSourcedModel } from '@cozemble/model-event-sourced'
import { type ModelEvent, type ModelId } from '@cozemble/model-core'
import { arrays } from '@cozemble/lang-util'
import { actionToSql, schema } from '@cozemble/sql-actions'
import { appPublicKnex, ModelEventTableRow, ModelTableRow, SqlMigrationsKnexSource } from '../knex'
import { pgUrl } from '../config'
import { sqlActionsPlayer } from '@cozemble/model-sql-actions-player'

const router: Router = Router()

router.get('/', (req: Request, res: Response) => {
  return res.status(200).json({
    statusCode: 200,
    message: 'success',
  })
})

type ModelEventAndModelId = { event: ModelEvent; modelId: ModelId }

function asModelTableRow(e: EventSourcedModel): ModelTableRow {
  return {
    model_id: e.model.id.value,
    name: e.model.name.value,
    definition: JSON.stringify(e.model),
    created_at: new Date(),
    updated_at: new Date(),
  }
}

function asModelEventTableRow(e: ModelEventAndModelId): ModelEventTableRow {
  return {
    model_event_id: e.event.id.value,
    model_id: e.modelId.value,
    definition: JSON.stringify(e.event),
    created_at: new Date(),
    updated_at: new Date(),
  }
}

router.get('/list', async (req: Request, res: Response) => {
  const knex = await appPublicKnex(pgUrl)
  const models = await knex<ModelTableRow>('cozemble.models').select()
  const result = models.map((m) => m.definition)
  return res.status(200).json(result)
})

router.post('/apply/', async (req: Request, res: Response) => {
  const models: EventSourcedModel[] = req.body
  const events = models.flatMap((model) =>
    model.events.map((event) => ({ event, modelId: model.model.id })),
  )
  const sorted = arrays.sortBy(events, (e: ModelEventAndModelId) => e.event.timestamp.value)

  const actions = sqlActionsPlayer.play(models)
  const theSchema = schema('public')
  const migrations = actions.map((a) => actionToSql(theSchema, a))
  const knex = await appPublicKnex(pgUrl)
  const source = new SqlMigrationsKnexSource(migrations)
  try {
    await knex.migrate.latest({ migrationSource: source })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      message: e.message,
    })
  }

  const modelTableRows = models.map(asModelTableRow)
  const modelEventRows = sorted.flatMap(asModelEventTableRow)
  try {
    knex.transaction(async function (trx) {
      await trx('cozemble.models').insert(modelTableRows).onConflict('model_id').merge()
      await trx('cozemble.model_events')
        .insert(modelEventRows)
        .onConflict('model_event_id')
        .ignore()
      return res.status(200).send()
    })
  } catch (e: any) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      message: e.message,
    })
  }
})

export default router
