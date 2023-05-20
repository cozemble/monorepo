import type { Backend, FetchRecordsResponse, FetchTenantResponse, TenantEntity } from './Backend'
import type { DataRecord, DataRecordId, Model, ModelId } from '@cozemble/model-core'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import { uuids } from '@cozemble/lang-util'
import { EventSourcedDataRecord } from '@cozemble/model-event-sourced'

const storageKey = 'cozemble.localstorage.backend'

interface LocalStorageBackendState {
  models: BackendModel[]
  records: DataRecord[]
  uploadedAttachments: UploadedAttachment[]
  entities: TenantEntity[]
}

export class LocalStorageBackend implements Backend {
  private state: LocalStorageBackendState = {
    uploadedAttachments: [],
    records: [],
    models: [],
    entities: [],
  }

  constructor() {
    const state = localStorage.getItem(storageKey)
    if (state) {
      this.state = JSON.parse(state)
    }
  }

  async deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
    this._updateState((state) => ({
      ...state,
      uploadedAttachments: state.uploadedAttachments.filter(
        (attachment) => !attachmentIds.includes(attachment.attachmentId),
      ),
    }))
  }

  async deleteRecord(
    tenantId: string,
    modelId: string,
    record: DataRecord,
  ): Promise<RecordDeleteOutcome> {
    this._updateState((state) => ({
      ...state,
      records: state.records.filter((r) => r.id.value !== record.id.value),
    }))
    return recordSaveSucceeded(record)
  }

  async fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<FetchRecordsResponse> {
    const records = this.state.records.filter((r) => r.modelId.value === modelId)
    return { records }
  }

  async findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<DataRecord | null> {
    return this.state.records.find((r) => r.id.value === recordId.value) ?? null
  }

  async getAttachmentViewUrls(
    tenantId: string,
    attachments: AttachmentIdAndFileName[],
  ): Promise<string[]> {
    throw new Error('Method not implemented.')
  }

  async getTenantDetails(tenantId: string): Promise<FetchTenantResponse> {
    return {
      id: tenantId,
      name: 'Local Storage Backend Tenant',
      models: this.state.models.map((m) => m.model),
      events: this.state.models.flatMap((m) => m.events),
      entities: this.state.entities,
    }
  }

  async putModels(tenantId: string, models: BackendModel[]): Promise<any> {
    this._updateState((state) => ({
      ...state,
      models,
    }))
  }

  referencingRecords(
    tenantId: string,
    recordId: DataRecordId,
    referencingModelId: ModelId,
  ): Promise<DataRecord[]> {
    throw new Error('Method not implemented.')
  }

  async saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any> {
    this._updateState((state) => ({
      ...state,
      entities: state.entities.map((e) => {
        const newEntity = entities.find((newE) => newE.id === e.id)
        return newEntity ?? e
      }),
    }))
  }

  async saveRecord(
    tenantId: string,
    models: Model[],
    newRecord: EventSourcedDataRecord,
  ): Promise<RecordSaveOutcome> {
    const existingRecord = this.state.records.find((r) => r.id.value === newRecord.record.id.value)
    if (!existingRecord) {
      this._updateState((state) => ({
        ...state,
        records: [...state.records, newRecord.record],
      }))
    } else {
      this._updateState((state) => ({
        ...state,
        records: state.records.map((r) => {
          if (r.id.value === newRecord.record.id.value) {
            return newRecord.record
          }
          return r
        }),
      }))
    }
    return recordSaveSucceeded(newRecord.record)
  }

  tradeAuthTokenForSession(
    authorizationCode: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    return Promise.resolve({ accessToken: 'stub access token', refreshToken: 'stub refresh token' })
  }

  async uploadAttachments(
    tenantId: string,
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    const uploaded: UploadedAttachment[] = files.map((f) => ({
      _type: 'uploaded.attachment',
      attachmentId: uuids.v4(),
      file: f,
      size: null,
      thumbnailUrl: 'https://avatars.githubusercontent.com/u/121632088?s=96&v=4',
    }))

    progressUpdater(100)
    this._updateState((state) => ({
      ...state,
      uploadedAttachments: [...state.uploadedAttachments, ...uploaded],
    }))
    return uploaded
  }

  private _updateState(updater: (s: LocalStorageBackendState) => LocalStorageBackendState) {
    this.state = updater(this.state)
    this._storeState()
  }

  private _storeState() {
    localStorage.setItem(storageKey, JSON.stringify(this.state))
  }
}
