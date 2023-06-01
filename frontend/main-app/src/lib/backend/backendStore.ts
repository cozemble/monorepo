import { type Backend, ErrorListenerBackend } from '@cozemble/frontend-bff'
import type { TenantEntity } from '@cozemble/frontend-bff'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'

export const notImplementedBackend: Backend = {
  deleteAttachments() {
    throw new Error(`Not implemented`)
  },
  deleteRecord() {
    throw new Error(`Not implemented`)
  },
  fetchRecords() {
    throw new Error(`Not implemented`)
  },
  findRecordById() {
    throw new Error(`Not implemented`)
  },
  getAttachmentViewUrls() {
    throw new Error(`Not implemented`)
  },
  putModels() {
    throw new Error(`Not implemented`)
  },
  referencingRecords() {
    throw new Error(`Not implemented`)
  },
  saveEntities() {
    throw new Error(`Not implemented`)
  },
  saveRecord() {
    throw new Error(`Not implemented`)
  },
  saveRecords() {
    throw new Error(`Not implemented`)
  },
  tradeAuthTokenForSession() {
    throw new Error(`Not implemented`)
  },
  uploadAttachments() {
    throw new Error(`Not implemented`)
  },
  getTenantDetails: async () => {
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
