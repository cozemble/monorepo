import { Router } from 'express'
import multer from 'multer'
import sharp from 'sharp'
import { authenticatedDatabaseRequest } from '../infra/authenticatedDatabaseRequest'

export function makeStorageRoute(upload: multer.Multer) {
  const router: Router = Router()
  router.post('/files/:tenantId', upload.array('file'), (req, res) => {
    return authenticatedDatabaseRequest(req, res, async (client) => {
      if (!req.files) {
        return res.status(400).json({
          message: 'No files uploaded',
        })
      }
      const uploadedFiles = await Promise.all(
        (req.files as Express.Multer.File[]).map(async (file) => {
          let result: any = {
            originalName: file.originalname,
            mimeType: file.mimetype,
            sizeInBytes: file.size,
          }

          if (file.mimetype.startsWith('image/')) {
            const metadata = await sharp(file.buffer).metadata()
            const imageSize = {
              width: metadata.width,
              height: metadata.height,
            }
            result = { ...result, imageSize }
          }
          return result
        }),
      )

      res.status(201).json(uploadedFiles)
    })
  })
  return router
}
