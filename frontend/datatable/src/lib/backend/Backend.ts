import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type {
  DataRecord,
  DataRecordId,
  ModelId,
  ModelView,
  RecordGraph,
} from '@cozemble/model-core'
import type { AttachmentsManager, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type { FilterGroupList } from '@cozemble/data-filters-core'
import { filterGroupListFns } from '@cozemble/data-filters-core'

export interface FilterParams {
  search: string | null
  filters: FilterGroupList
}

export function emptyFilterParams(): FilterParams {
  return { search: null, filters: filterGroupListFns.empty() }
}

export interface RecordSaver {
  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveExistingRecord(record: EventSourcedDataRecord): Promise<RecordSaveOutcome>
}

export interface Backend extends AttachmentsManager, RecordSaver {
  saveModel(model: EventSourcedModel): Promise<JustErrorMessage | null>

  saveModels(model: EventSourcedModel[]): Promise<JustErrorMessage | null>

  getRecords(modelId: ModelId, filterParams: FilterParams): Promise<RecordGraph>

  searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null>

  saveModelView(modelView: ModelView): Promise<JustErrorMessage | null>
}

export const notImplementedBackend: Backend = {
  saveNewRecord(): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },
  saveExistingRecord(): Promise<RecordSaveOutcome> {
    throw new Error('Not implemented')
  },
  saveModel: async () => {
    throw new Error('Not implemented')
  },
  saveModels: async () => {
    throw new Error('Not implemented')
  },
  getRecords: async (modelId) => {
    throw new Error('Not implemented')
  },
  recordById: async () => {
    throw new Error('Not implemented')
  },
  async searchRecords(): Promise<DataRecord[]> {
    throw new Error('Not implemented')
  },
  async saveModelView(): Promise<JustErrorMessage | null> {
    throw new Error('Not implemented')
  },
  async uploadAttachments(
    files: File[],
    progressUpdater: (percent: number) => void,
  ): Promise<UploadedAttachment[]> {
    throw new Error('Not implemented')
  },

  async deleteAttachments(attachmentIds: string[]): Promise<void> {
    throw new Error('Not implemented')
  },

  async getAttachmentViewUrls(attachmentIds: AttachmentIdAndFileName[]): Promise<string[]> {
    throw new Error('Not implemented')
  },
}
