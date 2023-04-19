import {
  type Backend,
  type FetchRecordsResponse,
  type FetchTenantResponse,
  notImplementedBackend,
} from './Backend'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { DataRecord, Model } from '@cozemble/model-core/dist/esm'
import type { TenantEntity } from '../models/tenantEntityStore'
import type { EventSourcedDataRecord, UploadedAttachment } from '@cozemble/data-editor-sdk'

export let backend = notImplementedBackend
export type ErrorListener = (e: any) => void
export const errorListener: ErrorListener[] = []

export function addErrorListener(listener: ErrorListener) {
  errorListener.push(listener)
}

export function removeErrorListener(listener: ErrorListener) {
  const index = errorListener.indexOf(listener)
  if (index >= 0) {
    errorListener.splice(index, 1)
  }
}

export function setBackend(newBackend: Backend) {
  backend = {
    async deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
      try {
        return await newBackend.deleteAttachments(tenantId, attachmentIds)
      } catch (e) {
        errorListener.forEach((l) => l(e))
      }
    },
    async deleteRecord(tenantId: string, modelId: string, record): Promise<RecordDeleteOutcome> {
      try {
        return await newBackend.deleteRecord(tenantId, modelId, record)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async fetchRecords(
      tenantId: string,
      modelId: string,
      search: string | null,
      filters: any,
    ): Promise<FetchRecordsResponse> {
      try {
        return await newBackend.fetchRecords(tenantId, modelId, search, filters)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async findRecordById(tenantId: string, modelId, recordId): Promise<DataRecord | null> {
      try {
        return await newBackend.findRecordById(tenantId, modelId, recordId)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async getAttachmentViewUrls(tenantId: string, attachments: []): Promise<string[]> {
      try {
        return await newBackend.getAttachmentViewUrls(tenantId, attachments)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async getTenantDetails(tenantId: string): Promise<FetchTenantResponse> {
      try {
        return await newBackend.getTenantDetails(tenantId)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async putModels(tenantId: string, models: []): Promise<any> {
      try {
        return await newBackend.putModels(tenantId, models)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async referencingRecords(
      tenantId: string,
      recordId,
      referencingModelId,
    ): Promise<DataRecord[]> {
      try {
        return await newBackend.referencingRecords(tenantId, recordId, referencingModelId)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any> {
      try {
        return await newBackend.saveEntities(tenantId, entities)
      } catch (e) {
        console.log({ e, errorListener })
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async saveRecord(
      tenantId: string,
      models: Model[],
      newRecord: EventSourcedDataRecord,
    ): Promise<RecordSaveOutcome> {
      try {
        return await newBackend.saveRecord(tenantId, models, newRecord)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async tradeAuthTokenForSession(
      authorizationCode: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
      try {
        return await newBackend.tradeAuthTokenForSession(authorizationCode)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
    async uploadAttachments(
      tenantId: string,
      files: File[],
      progressUpdater: (percent: number) => void,
    ): Promise<UploadedAttachment[]> {
      try {
        return await newBackend.uploadAttachments(tenantId, files, progressUpdater)
      } catch (e) {
        errorListener.forEach((l) => l(e))
        throw e
      }
    },
  }
}
