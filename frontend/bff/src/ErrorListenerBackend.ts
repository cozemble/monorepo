import { Backend, FetchTenantResponse, TenantEntity } from './Backend'
import {
  DataRecord,
  DataRecordId,
  Id,
  Model,
  ModelId,
  RecordAndEdges,
  RecordGraphEdge,
  RecordsAndEdges,
} from '@cozemble/model-core'
import { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { AttachmentIdAndFileName, UploadedAttachment } from '@cozemble/data-editor-sdk'
import { BackendModel } from '@cozemble/backend-tenanted-api-types'
import { EventSourcedDataRecord } from '@cozemble/model-event-sourced'

export type ErrorListener = (e: any) => void

export class ErrorListenerBackend implements Backend {
  constructor(private readonly backend: Backend, private errorListeners: ErrorListener[] = []) {}

  addErrorListener(listener: ErrorListener) {
    this.errorListeners.push(listener)
  }

  removeErrorListener(listener: ErrorListener) {
    const index = this.errorListeners.indexOf(listener)
    if (index >= 0) {
      this.errorListeners.splice(index, 1)
    }
  }

  async deleteAttachments(tenantId: string, attachmentIds: string[]): Promise<void> {
    try {
      return await this.backend.deleteAttachments(tenantId, attachmentIds)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
    }
  }

  async deleteRecord(
    tenantId: string,
    modelId: string,
    record: DataRecord,
  ): Promise<RecordDeleteOutcome> {
    try {
      return await this.backend.deleteRecord(tenantId, modelId, record)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async fetchRecords(
    tenantId: string,
    modelId: string,
    search: string | null,
    filters: any,
  ): Promise<RecordsAndEdges> {
    try {
      return await this.backend.fetchRecords(tenantId, modelId, search, filters)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async findRecordById(
    tenantId: string,
    modelId: ModelId,
    recordId: DataRecordId,
  ): Promise<RecordAndEdges | null> {
    try {
      return await this.backend.findRecordById(tenantId, modelId, recordId)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async getAttachmentViewUrls(
    tenantId: string,
    attachments: AttachmentIdAndFileName[],
  ): Promise<string[]> {
    try {
      return await this.backend.getAttachmentViewUrls(tenantId, attachments)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async getTenantDetails(tenantId: string): Promise<FetchTenantResponse> {
    try {
      return await this.backend.getTenantDetails(tenantId)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async putModels(tenantId: string, models: BackendModel[]): Promise<any> {
    try {
      return await this.backend.putModels(tenantId, models)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async referencingRecords(
    tenantId: string,
    recordId: DataRecordId, // Customer
    referencingModelId: ModelId, // Booking
  ): Promise<DataRecord[]> {
    try {
      return await this.backend.referencingRecords(tenantId, recordId, referencingModelId)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async saveEntities(tenantId: string, entities: TenantEntity[]): Promise<any> {
    try {
      return await this.backend.saveEntities(tenantId, entities)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async saveRecord(
    tenantId: string,
    models: Model[],
    newRecord: EventSourcedDataRecord,
    edges: RecordGraphEdge[],
    deletedEdges: Id[],
  ): Promise<RecordSaveOutcome> {
    try {
      return await this.backend.saveRecord(tenantId, models, newRecord, edges, deletedEdges)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async tradeAuthTokenForSession(
    authorizationCode: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      return await this.backend.tradeAuthTokenForSession(authorizationCode)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }

  async uploadAttachments(
    tenantId: string,
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    try {
      return await this.backend.uploadAttachments(tenantId, files, progressUpdater)
    } catch (e) {
      this.errorListeners.forEach((l) => l(e))
      throw e
    }
  }
}
