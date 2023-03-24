import express, { Router } from 'express'
import multer from 'multer'
import { authenticatedDatabaseRequest } from '../infra/authenticatedDatabaseRequest'
import pg from 'pg'
import { canAccessTenant } from '../infra/middleware'
import { mandatory } from '@cozemble/lang-util'

async function createObject(
  client: pg.PoolClient,
  tenantId: string,
  file: Express.Multer.File,
): Promise<any | null> {
  const createObjectResponse = await client.query(
    `SELECT create_object( $1, $2, $3, $4, $5, $6, $7, $8 ) as object_id;`,
    [
      mandatory((file as any).fileId, `No file id provided`),
      tenantId,
      file.originalname,
      file.size,
      file.mimetype,
      mandatory((file as any).storageProvider, `No storageProvider provided`),
      mandatory((file as any).storageDetails, `No storageDetails provided`),
      {},
    ],
  )
  if (createObjectResponse.rows.length === 0 || createObjectResponse.rows[0].object_id === null) {
    return null
  }
  return createObjectResponse.rows[0].object_id
}

async function processUpload(
  client: pg.PoolClient,
  req: express.Request,
  file: Express.Multer.File,
) {
  const object = await createObject(client, req.params.tenantId, file)
  if (object === null) {
    return null
  }
  return {
    fileId: object.id,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeInBytes: file.size,
  }
}

export function makeStorageRoute(upload: multer.Multer) {
  const router: Router = Router()

  router.post('/files/:tenantId', canAccessTenant, upload.array('file'), (req, res) => {
    return authenticatedDatabaseRequest(req, res, async (client) => {
      if (!req.files) {
        return res.status(400).json({
          message: 'No files uploaded',
        })
      }
      const uploadedFiles = await Promise.all(
        (req.files as Express.Multer.File[]).map((file) => processUpload(client, req, file)),
      )
      if (uploadedFiles.some((uf) => uf === null)) {
        return res.status(403).send()
      }

      res.status(201).json(uploadedFiles)
    })
  })

  router.get('/files/:tenantId/:fileId', canAccessTenant, (req, res) => {
    return authenticatedDatabaseRequest(req, res, async (client) => {
      const { tenantId, fileId } = req.params
      const getObjectResponse = await client.query(
        `SELECT get_object_as_json( $1, $2 ) as object;`,
        [fileId, tenantId],
      )
      if (getObjectResponse.rows.length === 0 || getObjectResponse.rows[0].object === null) {
        return res.status(404).send()
      }
      const object = getObjectResponse.rows[0].object
      if (req.headers['accept'] === 'application/json') {
        return res.status(200).json({
          fileId: object.id,
          originalName: object.name,
          mimeType: object.mime_type,
          sizeInBytes: object.size_in_bytes,
          storageProvider: object.storage_provider,
          storageDetails: object.storage_details,
          metadata: object.metadata,
        })
      }
      return res.status(400).send()
    })
  })
  return router
}
