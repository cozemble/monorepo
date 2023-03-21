import type { UploadedAttachment } from '@cozemble/data-editor-sdk'

export interface AttachmentsManager {
  uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]>
}
