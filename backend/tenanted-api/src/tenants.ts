import { Request, Response, Router } from 'express'
import { withAdminPgClient } from './postgresPool'
import { authenticatedDatabaseRequest } from './authenticatedDatabaseRequest'

const router: Router = Router()

router.get('/:tenantId', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query('select * from get_tenant_info(text2Ltree($1)) as tenant;', [
      req.params.tenantId,
    ])
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    // I am not smart enough to know how to make the postgres function above return an empty array if there are no models,
    // so I am doing it here
    const tenant = result.rows[0].tenant
    if (tenant.models && tenant.models.length > 0 && tenant.models[0].id === null) {
      tenant.models = []
    }
    return res.status(200).json({ ...tenant })
  })
})

router.put('/:tenantId/model', (req: Request, res: Response) => {
  return authenticatedDatabaseRequest(req, res, async (client) => {
    const result = await client.query('select * from put_tenant_info($1) as tenant;', [req.body])
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).json({ ...result.rows[0].tenant })
  })
})

router.post('/', (req: Request, res: Response) => {
  return withAdminPgClient(async (client) => {
    const body = req.body
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
    const result = await client.query('select * from get_records(text2Ltree($1), $2) as records;', [
      req.params.tenantId,
      req.params.modelId,
    ])
    return res.status(200).json(result.rows[0].records)
  })
})

export default router
