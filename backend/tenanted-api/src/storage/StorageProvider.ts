export interface StorageProvider {
  storeThumbnail(
    tenantId: string,
    fileId: string,
    thumbnailBuffer: Buffer,
    contentType: string,
  ): Promise<string | null>

  storeFile(
    tenantId: string,
    fileId: string,
    file: Express.Multer.File,
  ): Promise<{ storageProvider: string; storageDetails: any }>

  createSignedUrl(tenantId: string, attachmentId: string): Promise<string>
}
