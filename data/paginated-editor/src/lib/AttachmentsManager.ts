import type { UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { AttachmentIdAndFileName } from '@cozemble/data-editor-sdk'

export interface AttachmentsManager {
  uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]>

  deleteAttachments(attachmentIds: string[]): Promise<void>

  getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]>
}
