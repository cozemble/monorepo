import { Request, Response, Router } from 'express'

const router: Router = Router()

router.get('/:tenantId', (req: Request, res: Response) => {
  return res.status(200).json({
    statusCode: 200,
    message: 'success',
  })
})

export default router
