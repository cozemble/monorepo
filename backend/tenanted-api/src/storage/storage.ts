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
          const createObjectResponse = await client.query(
            `SELECT create_object( $1, $2, $3, $4, $5, $6, $7 ) as object_id;`,
            [
              req.params.tenantId,
              file.originalname,
              file.size,
              file.mimetype,
              'GCS',
              { _type: 'google.cloud.storage.object.id', bucket: 'to-do', path: 'to-do' },
              {},
            ],
          )
          if (
            createObjectResponse.rows.length === 0 ||
            createObjectResponse.rows[0].object_id === null
          ) {
            return null
          }
          let result: any = {
            fileId: createObjectResponse.rows[0].object_id,
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
      if (uploadedFiles.some((uf) => uf === null)) {
        return res.status(403).send()
      }

      res.status(201).json(uploadedFiles)
    })
  })
  return router
}
