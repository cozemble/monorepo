import { Router } from 'express'
import { canAccessTenant } from '../infra/middleware'
import { StorageProvider } from './StorageProvider'
import { withAccessToken } from '../infra/jwt'
import { mandatory } from '@cozemble/lang-util'

export function makeSignedUrlsRoute(storageProvider: StorageProvider) {
  const router: Router = Router()

  router.post('/urls/:tenantId/:attachmentId/:fileName', canAccessTenant, (req, res) => {
    return withAccessToken(req, res, async (claim) => {
      const env = mandatory(req.env, `No env in request`)
      const tenantId = (req.params.tenantId as string) ?? null
      const attachmentId = (req.params.attachmentId as string) ?? null
      const fileName = (req.params.fileName as string) ?? null
      if (!tenantId || !attachmentId || !fileName || !env) {
        return res.status(400).json({
          message: 'Missing env, tenantId, attachmentId or fileName',
        })
      }

      const url = await storageProvider.createSignedUrl(env, tenantId, attachmentId, fileName)
      return res.status(201).json({ url })
    })
  })

  return router
}
