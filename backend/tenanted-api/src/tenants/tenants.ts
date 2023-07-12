import { Request, Response, Router } from 'express'
import { withAdminPgClient } from '../infra/postgresPool.ts'
import { authenticatedDatabaseRequest } from '../infra/authenticatedDatabaseRequest.ts'
import {
  BackendModel,
  CreateTenant,
  FilterRequestPayload,
  SavableRecords,
} from '@cozemble/backend-tenanted-api-types'
import { Model } from '@cozemble/model-core'
import { modelFns, modelPathFns } from '@cozemble/model-api'
import { formattedFilters } from './formattedFilters.ts'
import { mandatory } from '@cozemble/lang-util'

const router: Router = Router()

router.get('/:tenantId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_tenant_info($1,text2Ltree($2)) as tenant;',
      [mandatory(req.env, `No env in request`), req.params.tenantId],
    )
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    const tenant = result.rows[0].tenant
    return res.status(200).json({ ...tenant })
  })
})

interface SavableModel extends BackendModel {
  uniquePaths: string[]
}

function uniquePathsInModel(models: Model[], model: Model): string[] {
  try {
    return modelFns
      .pathsToUniqueProperties(models, model)
      .map((p) => modelPathFns.toDottedIdPath(p).value)
  } catch (e) {
    console.error('Error getting unique paths for model: ' + JSON.stringify(model))
    console.error(e)
    return []
  }
}

router.put('/:tenantId/model', (req: Request, res: Response) => {
  const models: BackendModel[] = Array.isArray(req.body) ? req.body : [req.body]
  if (models.some((m) => m._type !== 'backend.model')) {
    console.error('Body is not an instance of backend.model: ' + JSON.stringify(req.body))
    return res.status(400).send()
  }
  const allModels = models.map((m) => m.model)
  const savableModels = models.map((m) => {
    const sm: SavableModel = { ...m, uniquePaths: uniquePathsInModel(allModels, m.model) }
    return sm
  })
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from put_tenant_info($1,text2ltree($2),$3) as tenant;',
      [mandatory(req.env, `No env in request`), req.params.tenantId, JSON.stringify(savableModels)],
    )
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).json({ ...result.rows[0].tenant })
  })
})

router.post('/', (req: Request, res: Response) => {
  return withAdminPgClient(async (client) => {
    const body = req.body as CreateTenant
    if (body._type !== 'create.tenant') {
      return res.status(400).send()
    }
    const result = await client.query(
      'select * from post_tenant($1,text2Ltree($2),$3, text2Ltree($4), $5, $6, $7) as tenant;',
      [
        mandatory(req.env, `No env in request`),
        body.id,
        body.name,
        body.owner.userPool,
        body.owner.id,
        body.owner.email,
        body.owner.firstName,
      ],
    )
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).json({ ...result.rows[0].tenant })
  }).catch((e) => {
    console.error(e)
    return res.status(500).send()
  })
})

router.put('/:tenantId/model/:modelId/record', (req: Request, res: Response) => {
  return putRecords(req, res)
})

function putRecords(req: Request, res: Response) {
  if (req.body._type !== 'savable.records') {
    console.error('Body is not an instance of savable.records: ' + JSON.stringify(req.body))
    return res.status(400).send()
  }
  const records: SavableRecords = req.body
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from upsert_records_and_edges($1,text2Ltree($2), $3) as records;',
      [mandatory(req.env, `No env in request`), req.params.tenantId, JSON.stringify(records)],
    )
    if (result.rows.length === 0 || result.rows[0].records === null) {
      return res.status(400).send()
    }
    if (result.rows[0].records._type === 'error.conflict') {
      return res.status(409).json(result.rows[0].records)
    }
    return res.status(200).json(result.rows[0].records)
  })
}

router.put('/:tenantId/record', (req: Request, res: Response) => {
  return putRecords(req, res)
})

router.post('/:tenantId/model/:modelId/record', (req: Request, res: Response) => {
  if (req.body._type !== 'filter.request.payload') {
    console.error('Body is not an instance of filter.request.payload: ' + JSON.stringify(req.body))
    return res.status(400).send()
  }
  const filter: FilterRequestPayload = req.body
  const preppedFilters = filter.filter === null ? {} : formattedFilters(filter.filter)
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_records($1,text2Ltree($2), $3, $4, $5) as records;',
      [
        mandatory(req.env, `No env in request`),
        req.params.tenantId,
        req.params.modelId,
        filter.query,
        JSON.stringify(preppedFilters),
      ],
    )
    return res.status(200).json(result.rows[0].records)
  })
})

router.get('/:tenantId/model/:modelId/record/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_record($1,text2Ltree($2), $3, $4) as record;',
      [
        mandatory(req.env, `No env in request`),
        req.params.tenantId,
        req.params.modelId,
        req.params.recordId,
      ],
    )
    return res.status(200).json(result.rows[0].record)
  })
})

router.get('/:tenantId/model/:modelId/referencing/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_records_that_reference($1,text2Ltree($2), $3, $4) as records;',
      [
        mandatory(req.env, `No env in request`),
        req.params.tenantId,
        req.params.modelId,
        req.params.recordId,
      ],
    )
    return res.status(200).json(result.rows[0])
  })
})

router.delete('/:tenantId/model/:modelId/record/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    await client.query(
      'delete from record where env = $1 and tenant = text2Ltree($2) and model_id = $3 and id = $4;',
      [
        mandatory(req.env, `No env in request`),
        req.params.tenantId,
        req.params.modelId,
        req.params.recordId,
      ],
    )
    return res.status(204).send()
  })
})

router.put('/:tenantId/entity', (req: Request, res: Response) => {
  const entities = Array.isArray(req.body) ? req.body : [req.body]
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from upsert_tenant_entity_from_jsonb_array($1,$2::ltree, $3::jsonb[]);',
      [mandatory(req.env, `No env in request`), req.params.tenantId, entities],
    )
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).send()
  })
})

router.get('/:tenantId/entity', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_tenant_entities_definitions($1,$2::ltree);',
      [mandatory(req.env, `No env in request`), req.params.tenantId],
    )

    if (result.rows.length === 0 || result.rows[0].get_tenant_entities_definitions === null) {
      return res.status(404).send()
    }

    return res.status(200).json(result.rows[0].get_tenant_entities_definitions)
  })
})

router.post('/:tenantId/model/:modelId/record/recordEdges', (req: Request, res: Response) => {
  const edges = Array.isArray(req.body) ? req.body : [req.body]
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from insert_record_edges($1,$2::ltree, $3::jsonb[]);',
      [mandatory(req.env, `No env in request`), req.params.tenantId, edges],
    )
    if (result.rows.length === 0) {
      return res.status(404).send()
    }
    return res.status(200).send()
  })
})

export default router
