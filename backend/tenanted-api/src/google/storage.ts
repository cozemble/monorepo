import express, { Express } from 'express'
import multer from 'multer'
import MulterGoogleCloudStorage from 'multer-cloud-storage'
import { uuids } from '@cozemble/lang-util'
import * as path from 'path'

const bucketName = 'cozemble-objects-1'

function getDestination(req: express.Request) {
  const tenantId = (req.params.tenantId as string) ?? null
  if (!tenantId) {
    throw new Error(`No tenant id provided`)
  }
  return `tenant/${tenantId}/file`
}

export function makeMulterGoogleStorage() {
  return multer({
    storage: new MulterGoogleCloudStorage({
      projectId: 'cozemble',
      bucket: bucketName,
      contentType: (req: express.Request, file: Express.Multer.File) => {
        return file.mimetype
      },
      destination: (
        req: express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename?: string) => void,
      ) => {
        try {
          const destination = getDestination(req)
          callback(null, destination)
        } catch (e: any) {
          callback(e)
        }
      },

      filename: (
        req: express.Request,
        file: Express.Multer.File,
        callback: (error: Error | null, filename?: string) => void,
      ) => {
        const fileId = uuids.v4()
        const fileExtension = path.extname(file.originalname)
        const filename = `${fileId}${fileExtension}`
        ;(file as any).fileId = fileId
        ;(file as any).storageProvider = 'GCS'
        ;(file as any).storageDetails = {
          _type: 'google.cloud.storage.object.id',
          bucket: bucketName,
          path: `${getDestination(req)}/${filename}`,
        }
        callback(null, filename)
      },
    }),
  })
}
