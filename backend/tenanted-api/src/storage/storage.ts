import express, { Router } from 'express'
import multer from 'multer'
import { authenticatedDatabaseRequest } from '../infra/authenticatedDatabaseRequest.ts'
import pg from 'pg'
import { canAccessTenant } from '../infra/middleware.ts'
import { uuids, mandatory } from '@cozemble/lang-util'
import { getFileObject } from './getFileObject.ts'
import { StorageProvider } from './StorageProvider.ts'
import sharp from 'sharp'

const thumbnailWidth = 100

async function createObject(
  client: pg.PoolClient,
  env: string,
  tenantId: string,
  file: Express.Multer.File,
  fileId: string,
  storageProvider: string,
  storageDetails: any,
  thumbnailUrl: string | null,
): Promise<any | null> {
  const createObjectResponse = await client.query(
    `SELECT create_object( $1, $2, $3, $4, $5, $6, $7, $8,$9,$10 ) as object_id;`,
    [
      env,
      fileId,
      tenantId,
      file.originalname,
      file.size,
      file.mimetype,
      storageProvider,
      storageDetails,
      {},
      thumbnailUrl,
    ],
  )
  if (createObjectResponse.rows.length === 0 || createObjectResponse.rows[0].object_id === null) {
    return null
  }
  return createObjectResponse.rows[0].object_id
}

async function processUpload(
  client: pg.PoolClient,
  storageProvider: StorageProvider,
  env: string,
  tenantId: string,
  file: Express.Multer.File,
) {
  const fileId = uuids.v4()
  let thumbnailUrl: string | null = null
  if (file.mimetype.startsWith('image/')) {
    const thumbnailBuffer = await sharp(file.buffer).resize(thumbnailWidth).png().toBuffer()
    thumbnailUrl = await storageProvider.storeThumbnail(
      env,
      tenantId,
      fileId,
      thumbnailBuffer,
      'image/png',
    )
  }
  const { storageProvider: storageProviderName, storageDetails } = await storageProvider.storeFile(
    env,
    tenantId,
    fileId,
    file,
  )
  const object = await createObject(
    client,
    env,
    tenantId,
    file,
    fileId,
    storageProviderName,
    storageDetails,
    thumbnailUrl,
  )
  if (object === null) {
    return null
  }
  return {
    fileId: object.id,
    originalName: file.originalname,
    mimeType: file.mimetype,
    sizeInBytes: file.size,
    thumbnailUrl,
  }
}

async function handleUpload(
  client: pg.PoolClient,
  storageProvider: StorageProvider,
  env: string,
  tenantId: string,
  req: express.Request,
  res: express.Response,
) {
  const uploadedFiles = await Promise.all(
    (req.files as Express.Multer.File[]).map((file) =>
      processUpload(client, storageProvider, env, tenantId, file),
    ),
  )
  if (uploadedFiles.some((uf) => uf === null)) {
    return res.status(403).send()
  }

  res.status(201).json(uploadedFiles)
}

const upload = multer({ storage: multer.memoryStorage() })

export function makeStorageRoute(storageProvider: StorageProvider) {
  const router: Router = Router()

  router.post('/files/:tenantId', canAccessTenant, upload.array('file'), (req, res) => {
    return authenticatedDatabaseRequest(req, res, async (client) => {
      if (!req.files) {
        return res.status(400).json({
          message: 'No files uploaded',
        })
      }
      const env = mandatory(req.env, `No env in request`)
      const tenantId = (req.params.tenantId as string) ?? null
      if (!tenantId || !env) {
        return res.status(400).json({
          message: 'No tenant id or env provided',
        })
      }

      return await handleUpload(client, storageProvider, env, tenantId, req, res)
    })
  })

  router.get('/files/:tenantId/:fileId', canAccessTenant, (req, res) => {
    return authenticatedDatabaseRequest(req, res, async (client) => {
      const object = await getFileObject(req, res, client)
      if (object !== null) {
        if (req.headers['accept'] === 'application/json') {
          return res.status(200).json({
            fileId: object.id,
            originalName: object.name,
            mimeType: object.mime_type,
            sizeInBytes: object.size_in_bytes,
            storageProvider: object.storage_provider,
            storageDetails: object.storage_details,
            metadata: object.metadata,
            thumbnailUrl: object.thumbnail_url,
          })
        }
        return res.status(400).send()
      }
    })
  })

  return router
}
