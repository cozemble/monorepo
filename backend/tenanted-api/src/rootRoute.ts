import { Request, Response, Router } from 'express'
import { inTxn, withAdminPgClient } from './postgresPool'

const router: Router = Router()

router.get('/', (req: Request, res: Response) => {
  return withAdminPgClient(async (client) => {
    const result = await client.query('select count(*) from tenant')
    if (result.rows.length === 0) {
      return res.status(404).json({
        statusCode: 404,
        message: 'error',
      })
    }

    return inTxn(client, async () => {
      return res.status(200).json({ num: result.rows[0].count })
    })
  }).catch((e) => {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      message: 'error',
    })
  })
})

export default router
