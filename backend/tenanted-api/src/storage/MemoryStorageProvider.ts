import { StorageProvider } from './StorageProvider'

export class MemoryStorageProvider implements StorageProvider {
  async storeFile(
    tenantId: string,
    fileId: string,
    file: Express.Multer.File,
  ): Promise<{ storageProvider: string; storageDetails: any }> {
    return { storageDetails: {}, storageProvider: 'memory' }
  }

  async storeThumbnail(
    tenantId: string,
    fileId: string,
    thumbnailBuffer: Buffer,
    contentType: string,
  ): Promise<string | null> {
    return 'https://via.placeholder.com/150'
  }

  async createSignedUrl(tenantId: string, attachmentId: string, fileName: string): Promise<string> {
    return `placeholder url for tenant id ${tenantId} and attachment id ${attachmentId}`
  }
}
