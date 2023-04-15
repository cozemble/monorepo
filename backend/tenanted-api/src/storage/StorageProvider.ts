export interface StorageProvider {
  storeThumbnail(
    env: string,
    tenantId: string,
    fileId: string,
    thumbnailBuffer: Buffer,
    contentType: string,
  ): Promise<string | null>

  storeFile(
    env: string,
    tenantId: string,
    fileId: string,
    file: Express.Multer.File,
  ): Promise<{ storageProvider: string; storageDetails: any }>

  createSignedUrl(
    env: string,
    tenantId: string,
    attachmentId: string,
    fileName: string,
  ): Promise<string>
}
