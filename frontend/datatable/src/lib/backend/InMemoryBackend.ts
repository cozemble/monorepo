import type { Backend } from './Backend'
import type { JustErrorMessage } from '@cozemble/lang-util'
import { uuids } from '@cozemble/lang-util'
import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, DataRecordId, ModelId, ModelView } from '@cozemble/model-core'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor'

export class InMemoryBackend implements Backend {
  constructor(
    private readonly models: Map<string, EventSourcedModel> = new Map(),
    private readonly records: Map<string, DataRecord[]> = new Map(),
    private readonly modelViews: ModelView[] = [],
    private attachments: UploadedAttachment[] = [],
  ) {}

  async saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null> {
    this.models.set(model.model.id.value, model)
    return null
  }

  async saveModels(models: EventSourcedModel[]): Promise<JustErrorMessage | null> {
    models.forEach((model) => this.models.set(model.model.id.value, model))
    return null
  }

  async getRecords(modelId: ModelId): Promise<DataRecord[]> {
    const records = this.records.get(modelId.value)
    return records || []
  }

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = [...existingRecords, newRecord.record]
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    return recordSaveSucceeded(newRecord.record)
  }

  async saveExistingRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    const existingRecords = this.records.get(newRecord.record.modelId.value) || []
    const updatedRecords = existingRecords.map((record) => {
      if (record.id.value === newRecord.record.id.value) {
        return newRecord.record
      }
      return record
    })
    this.records.set(newRecord.record.modelId.value, updatedRecords)
    return recordSaveSucceeded(newRecord.record)
  }

  async searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
    const records = this.records.get(modelId.value) || []
    if (search.trim().length === 0) return records
    return records.filter((record) => JSON.stringify(record.id.value).includes(search))
  }

  async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
    this.modelViews.push(modelView)
    return null
  }

  async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
    const records = this.records.get(modelId.value) || []
    return records.find((record) => record.id.value === recordId.value) || null
  }

  async uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    const uploadedAttachments: UploadedAttachment[] = files.map((file) => {
      return {
        _type: 'uploaded.attachment',
        attachmentId: uuids.v4(),
        file,
        size: null,
        thumbnailUrl: 'https://freesvg.org/img/ftthumbnail.png',
      }
    })
    this.attachments.push(...uploadedAttachments)
    progressUpdater(100)
    return uploadedAttachments
  }

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    this.attachments = this.attachments.filter((ua) => !attachmentIds.includes(ua.attachmentId))
  }

  async getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    return attachmentIds.map(
      (a) => 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a8/TEIDE.JPG/440px-TEIDE.JPG',
    )
  }
}
