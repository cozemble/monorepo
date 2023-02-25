import { Request, Response, Router } from 'express'
import { withAdminPgClient } from './postgresPool'

const router: Router = Router()

router.get('/:tenantId', (req: Request, res: Response) => {
  console.log('get tenant', req.params.tenantId)
  return withAdminPgClient(async (client) => {
    const result = await client.query('select * from get_tenant_info(text2Ltree($1)) as tenant;', [
      req.params.tenantId,
    ])
    console.log('result', result.rows)
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    // I am not smart enough to know how to make the postgres function above return an empty array if there are no models
    // so I am doing it here
    const tenant = result.rows[0].tenant
    if (tenant.models && tenant.models.length > 0 && tenant.models[0].id === null) {
      tenant.models = []
    }
    return res.status(200).json({ ...tenant })
  }).catch((e) => {
    console.error(e)
    return res.status(500).send()
  })
})

router.put('/:tenantId', (req: Request, res: Response) => {
  return withAdminPgClient(async (client) => {
    const result = await client.query('select * from put_tenant_info($1) as tenant;', [req.body])
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).json({ ...result.rows[0].tenant })
  }).catch((e) => {
    console.error(e)
    return res.status(500).send()
  })
})

router.post('/', (req: Request, res: Response) => {
  return withAdminPgClient(async (client) => {
    const result = await client.query('select * from post_tenant(text2Ltree($1), $2) as tenant;', [
      req.body.id,
      req.body.name,
    ])
    if (result.rows.length === 0 || result.rows[0].tenant === null) {
      return res.status(404).send()
    }
    return res.status(200).json({ ...result.rows[0].tenant })
  }).catch((e) => {
    console.error(e)
    return res.status(500).send()
  })
})

export default router
