import type { DataRecord, DataRecordId, Model, ModelEvent, ModelId } from '@cozemble/model-core'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'

export interface TenantEntity {
  _type: string
  id: { value: string }
  name: { value: string }
}

export interface FetchTenantResponse {
  id: string
  name: string
  models: Model[]
  events: ModelEvent[]
  entities: TenantEntity[]
}

export interface FetchRecordsResponse {
  records: DataRecord[]
}

export interface Backend {
  getTenantDetails(tenantId: string): Promise<FetchTenantResponse>

  deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void>

  uploadAttachments(
    tenantId: string,
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]>

  getAttachmentViewUrls(tenantId: string, attachments: AttachmentIdAndFileName[]): Promise<string[]>

  fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<FetchRecordsResponse>

  findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<DataRecord | null>

  deleteRecord(tenantId: string, modelId: string, record: DataRecord): Promise<RecordDeleteOutcome>

  saveRecord(
    tenantId: string,
    models: Model[],
    newRecord: EventSourcedDataRecord,
  ): Promise<RecordSaveOutcome>

  referencingRecords(
    tenantId: string,
    recordId: DataRecordId, // Customer
    referencingModelId: ModelId, // Booking
  ): Promise<DataRecord[]>

  putModels(tenantId: string, models: BackendModel[]): Promise<any>

  saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any>

  tradeAuthTokenForSession(
    authorizationCode: string,
  ): Promise<{ accessToken: string; refreshToken: string }>
}

export const notImplementedBackend: Backend = {
  deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
    throw new Error(`Not implemented`)
  },
  deleteRecord(tenantId: string, modelId: string, record): Promise<RecordDeleteOutcome> {
    throw new Error(`Not implemented`)
  },
  fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<FetchRecordsResponse> {
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
