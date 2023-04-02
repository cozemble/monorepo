import { Request, Response, Router } from 'express'
import { withAdminPgClient } from '../infra/postgresPool'
import { authenticatedDatabaseRequest } from '../infra/authenticatedDatabaseRequest'
import { CreateTenant } from '@cozemble/backend-tenanted-api-types'

const router: Router = Router()

router.get('/:tenantId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query('select * from get_tenant_info(text2Ltree($1)) as tenant;', [
      req.params.tenantId,
    ])
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    const tenant = result.rows[0].tenant
    return res.status(200).json({ ...tenant })
  })
})

router.put('/:tenantId/model', (req: Request, res: Response) => {
  const models = Array.isArray(req.body) ? req.body : [req.body]
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from put_tenant_info(text2ltree($1),$2) as tenant;',
      [req.params.tenantId, JSON.stringify(models)],
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
      'select * from post_tenant(text2Ltree($1),$2, text2Ltree($3), $4, $5, $6) as tenant;',
      [
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
  if (!Array.isArray(req.body)) {
    console.log('Bad request, expected body to be an array: ' + JSON.stringify(req.body))
    return res.status(400).send()
  }

  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from upsert_record(text2Ltree($1), $2) as records;',
      [req.params.tenantId, JSON.stringify(req.body)],
    )
    if (result.rows.length === 0 || result.rows[0].records === null) {
      return res.status(400).send()
    }

    return res.status(200).json([])
  })
})

router.get('/:tenantId/model/:modelId/record', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_records(text2Ltree($1), $2, $3) as records;',
      [req.params.tenantId, req.params.modelId, req.query.q],
    )
    return res.status(200).json(result.rows[0].records)
  })
})

router.get('/:tenantId/model/:modelId/record/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_record(text2Ltree($1), $2, $3) as record;',
      [req.params.tenantId, req.params.modelId, req.params.recordId],
    )
    return res.status(200).json(result.rows[0].record)
  })
})

router.get('/:tenantId/model/:modelId/referencing/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from get_records_that_reference(text2Ltree($1), $2, $3) as records;',
      [req.params.tenantId, req.params.modelId, req.params.recordId],
    )
    return res.status(200).json(result.rows[0])
  })
})

router.delete('/:tenantId/model/:modelId/record/:recordId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    await client.query(
      'delete from record where tenant = text2Ltree($1) and model_id = $2 and id = $3;',
      [req.params.tenantId, req.params.modelId, req.params.recordId],
    )
    return res.status(204).send()
  })
})

router.put('/:tenantId/entity', (req: Request, res: Response) => {
  const entities = Array.isArray(req.body) ? req.body : [req.body]
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query(
      'select * from upsert_tenant_entity_from_jsonb_array($1::ltree, $2::jsonb[]);',
      [req.params.tenantId, entities],
    )
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).send()
  })
})

router.get('/:tenantId/entity', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query('select * from get_tenant_entities_definitions($1::ltree);', [
      req.params.tenantId,
    ])

    if (result.rows.length === 0 || result.rows[0].get_tenant_entities_definitions === null) {
      return res.status(404).send()
    }

    return res.status(200).json(result.rows[0].get_tenant_entities_definitions)
  })
})

export default router
