import type { DataRecord, DataRecordId, Model, ModelEvent, ModelId } from '@cozemble/model-core'
import {
  DataRecordValuePath,
  Id,
  RecordAndEdges,
  RecordGraphEdge,
  RecordsAndEdges,
} from '@cozemble/model-core'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { Outcome } from '@cozemble/lang-util'
import { JustErrorMessage } from '@cozemble/lang-util/dist/esm'

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

export interface RecordDataError {
  _type: 'record.data.error'
  recordId: DataRecordId
  dataErrors: Map<DataRecordValuePath, string[]>
}

export type RecordSaveFailure = JustErrorMessage | RecordDataError

export const recordDataErrorFns = {
  newInstance: (
    recordId: DataRecordId,
    dataErrors: Map<DataRecordValuePath, string[]>,
  ): RecordDataError => ({
    _type: 'record.data.error',
    recordId,
    dataErrors,
  }),
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
  ): Promise<RecordsAndEdges>

  findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<RecordAndEdges | null>

  deleteRecord(tenantId: string, modelId: string, record: DataRecord): Promise<RecordDeleteOutcome>

  saveRecord(
    tenantId: string,
    models: Model[],
    newRecord: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome>

  saveRecords(
    tenantId: string,
    models: Model[],
    records: EventSourcedDataRecord[],
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<Outcome<DataRecord[], RecordSaveFailure>>

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
