import { Storage } from '@google-cloud/storage'
import path from 'path'
import { StorageProvider } from './StorageProvider'

export class GoogleStorageProvider implements StorageProvider {
  private storage: Storage
  private readonly bucketName: string

  constructor(bucketName: string) {
    this.storage = new Storage()
    this.bucketName = bucketName
  }

  async storeFile(
    tenantId: string,
    fileId: string,
    file: Express.Multer.File,
  ): Promise<{ storageProvider: string; storageDetails: any }> {
    const bucket = this.storage.bucket(this.bucketName)
    const fileExtension = path.extname(file.originalname)
    const filePath = `tenant/${tenantId}/file/${fileId}${fileExtension}`
    const gcsFile = bucket.file(filePath)

    await gcsFile.save(file.buffer, {
      metadata: { contentType: file.mimetype },
    })

    return {
      storageProvider: 'GCS',
      storageDetails: {
        bucket: this.bucketName,
        filePath,
      },
    }
  }

  async storeThumbnail(
    tenantId: string,
    fileId: string,
    thumbnailBuffer: Buffer,
    contentType: string,
  ): Promise<string | null> {
    const bucket = this.storage.bucket(this.bucketName)
    const thumbnailPath = `tenant/${tenantId}/thumbnails/${fileId}.png`
    const thumbnailFile = bucket.file(thumbnailPath)

    await thumbnailFile.save(thumbnailBuffer, {
      metadata: { contentType },
    })

    // Make the thumbnail publicly accessible
    await thumbnailFile.acl.add({
      entity: 'allUsers',
      role: 'READER',
    })

    return `https://storage.googleapis.com/${this.bucketName}/${thumbnailPath}`
  }

  async createSignedUrl(tenantId: string, attachmentId: string): Promise<string> {
    const bucket = this.storage.bucket(this.bucketName)
    const attachmentPath = `tenant/${tenantId}/file/${attachmentId}`

    const gcsFile = bucket.file(attachmentPath)

    try {
      const [signedUrl] = await gcsFile.getSignedUrl({
        version: 'v4',
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60, // 1 hour from now
      })
      return signedUrl
    } catch (error: any) {
      throw new Error(`Failed to create signed URL: ${error.message}`)
    }
  }
}
