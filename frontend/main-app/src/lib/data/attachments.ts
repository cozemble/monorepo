import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import { backend } from '../backend/backendStore'

export async function uploadAttachments(
  tenantId: string,
  files: File[],
  progressUpdater: (percent: number) => void,
): Promise<UploadedAttachment[]> {
  return backend.uploadAttachments(tenantId, files, progressUpdater)
}

export async function deleteAttachments(tenantId: string, attachmentIds: string[]) {
  return backend.deleteAttachments(tenantId, attachmentIds)
}

export async function getAttachmentViewUrls(
  tenantId: string,
  attachments: AttachmentIdAndFileName[],
): Promise<string[]> {
  return backend.getAttachmentViewUrls(tenantId, attachments)
}
