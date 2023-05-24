import { type Backend, ErrorListenerBackend } from '@cozemble/frontend-bff'
import type { TenantEntity } from '@cozemble/frontend-bff'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'

export const notImplementedBackend: Backend = {
  deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
    throw new Error(`Not implemented`)
  },
  deleteRecord(tenantId: string, modelId: string, record): Promise<RecordDeleteOutcome> {
    throw new Error(`Not implemented`)
  },
  fetchRecords(tenantId: string, modelId: string, search: string | null, filters: any) {
    throw new Error(`Not implemented`)
  },
  findRecordById(tenantId: string, modelId, recordId): Promise<null> {
    throw new Error(`Not implemented`)
  },
  getAttachmentViewUrls(tenantId: string, attachments: []): Promise<string[]> {
    throw new Error(`Not implemented`)
  },
  putModels(tenantId: string, models: BackendModel[]): Promise<any> {
    throw new Error(`Not implemented`)
  },
  referencingRecords(tenantId: string, recordId, referencingModelId): Promise<[]> {
    throw new Error(`Not implemented`)
  },
  saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any> {
    throw new Error(`Not implemented`)
  },
  saveRecord(tenantId: string, models: [], newRecord): Promise<RecordSaveOutcome> {
    throw new Error(`Not implemented`)
  },
  tradeAuthTokenForSession(
    authorizationCode: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    throw new Error(`Not implemented`)
  },
  uploadAttachments(
    tenantId: string,
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<[]> {
    throw new Error(`Not implemented`)
  },
  getTenantDetails: async (tenantId: string) => {
    throw new Error(`Not implemented`)
  },
}

export let backend = notImplementedBackend
export type ErrorListener = (e: any) => void
export const errorListener: ErrorListener[] = []

export function addErrorListener(listener: ErrorListener) {
  errorListener.push(listener)
}

export function setBackend(newBackend: Backend) {
  backend = new ErrorListenerBackend(newBackend, errorListener)
}
