import type { Backend, FetchTenantResponse, TenantEntity } from './Backend.js'
import type { DataRecord, DataRecordId, Model, ModelId } from '@cozemble/model-core'
import {
  Id,
  RecordAndEdges,
  recordAndEdges,
  RecordGraphEdge,
  recordGraphEdgeFns,
  RecordsAndEdges,
  recordsAndEdges,
} from '@cozemble/model-core'
import type { RecordDeleteOutcome, RecordSaveOutcome, RecordSaveSucceeded, RecordSaveFailed } from '@cozemble/data-paginated-editor'
import type { BackendModel } from '@cozemble/backend-tenanted-api-types'
import type { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import { Outcome, uuids } from '@cozemble/lang-util'
import { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { outcomeFns } from '@cozemble/lang-util'

const storageKey = 'cozemble.localstorage.backend'

interface LocalStorageBackendState {
  models: BackendModel[]
  records: DataRecord[]
  edges: RecordGraphEdge[]
  uploadedAttachments: UploadedAttachment[]
  entities: TenantEntity[]
}

export class LocalStorageBackend implements Backend {
  private state: LocalStorageBackendState = {
    uploadedAttachments: [],
    records: [],
    models: [],
    edges: [],
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
    // @ts-ignore
    return recordSaveSucceeded(record)
  }

  async fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<RecordsAndEdges> {
    const records = this.state.records.filter((r) => r.modelId.value === modelId)
    return recordsAndEdges(
      records,
      recordGraphEdgeFns.forRecords(
        this.state.edges,
        records.map((r) => r.id),
      ),
    )
  }

  async findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<RecordAndEdges | null> {
    const maybeRecord = this.state.records.find((r) => r.id.value === recordId.value)
    if (maybeRecord) {
      return recordAndEdges(maybeRecord, [])
    }
    return null
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
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome> {
    const existingRecord = this.state.records.find((r) => r.id.value === newRecord.record.id.value)
    if (!existingRecord) {
      this._updateState((state) => ({
        ...state,
        records: [...state.records, newRecord.record],
        edges: [...state.edges, ...edges].filter(
          (e) => !deletedEdges.some((id) => id.value === e.id.value),
        ),
      }))
    } else {
      this._updateState((state) => ({
        ...state,
        edges: [...state.edges, ...edges].filter(
          (e) => !deletedEdges.some((id) => id.value === e.id.value),
        ),
        records: state.records.map((r) => {
          if (r.id.value === newRecord.record.id.value) {
            return newRecord.record
          }
          return r
        }),
      }))
    }
    // @ts-ignore
    return recordSaveSucceeded(newRecord.record)
  }

  async saveRecords(
    tenantId: string,
    models: Model[],
    records: EventSourcedDataRecord[],
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
    // @ts-ignore
  ): Promise<Outcome<DataRecord[]>> {
    const outcomes: RecordSaveOutcome[] = []
    for (let i = 0; i < records.length; i++) {
      if (i === records.length - 1) {
        outcomes.push(await this.saveRecord(tenantId, models, records[i], edges, deletedEdges))
      } else {
        outcomes.push(await this.saveRecord(tenantId, models, records[i], [], []))
      }
    }
    const firstFail = outcomes.find((o) => o._type === 'record.save.failed')
    if (firstFail) {
      return outcomeFns.unsuccessful((firstFail as RecordSaveFailed).errors[0] ?? 'Unknown error')
    }
    return outcomeFns.successful(outcomes.map((o) => (o as RecordSaveSucceeded).record))
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
