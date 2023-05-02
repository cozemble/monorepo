import { openRecordViews } from './openRecordViews'
import { deleteRecord, saveRecord } from './recordBackendHelper'
import { findRecordById, loadRecords } from './loadRecords'
import {
  deleteAttachments as deleteAttachmentsFn,
  getAttachmentViewUrls as getAttachmentViewUrlsFn,
  uploadAttachments as uploadAttachmentsFn,
} from './attachments'
import type { DataRecord, DataRecordId, Model, ModelId } from '@cozemble/model-core'
import type {
  PaginatedEditorHost,
  RecordDeleteOutcome,
  RecordSaveOutcome,
} from '@cozemble/data-paginated-editor'
import type {
  AttachmentIdAndFileName,
  EventSourcedDataRecord,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type { Writable } from 'svelte/store'
import type { UserInstruction } from '@cozemble/data-editor-sdk'
import { userInstructionStoreFns } from '../notices/userInstructionStore'
import type { ModelView } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'

export function makePaginatedEditorHost(
  tenantId: string,
  models: Model[],
  model: Model,
  records: Writable<DataRecord[]>,
): PaginatedEditorHost {
  const paginatedEditorHost: PaginatedEditorHost = {
    viewRecord(record: DataRecord, openNow: boolean): void {
      openRecordViews.open(record.modelId, record.id, openNow)
    },
    async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
      const result = await saveRecord(tenantId, models, editedRecord)
      if (result._type === 'record.save.succeeded') {
        records.update((r) =>
          r.map((r) => (r.id.value === editedRecord.record.id.value ? editedRecord.record : r)),
        )
      }
      return result
    },

    async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
      const result = await saveRecord(tenantId, models, newRecord)
      if (
        result._type === 'record.save.succeeded' &&
        newRecord.record.modelId.value === model.id.value
      ) {
        records.update((r) => [...r, newRecord.record])
      }
      return result
    },

    async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
      const result = await deleteRecord(tenantId, model.id.value, record)
      if (result._type === 'record.save.succeeded') {
        records.update((r) => r.filter((r) => r.id.value !== record.id.value))
      }
      return result
    },

    async searchRecords(modelId: ModelId, searchText: string): Promise<DataRecord[]> {
      const result = await loadRecords(
        tenantId,
        modelId.value,
        searchText.trim().length === 0 ? null : searchText,
      )
      return result.records
    },

    async recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
      return findRecordById(tenantId, modelId, recordId)
    },

    uploadAttachments(
      files: File[],
      progressUpdater: (percent: number) => void,
    ): Promise<UploadedAttachment[]> {
      return uploadAttachmentsFn(tenantId, files, progressUpdater)
    },

    async deleteAttachments(attachmentIds: string[]): Promise<void> {
      return deleteAttachmentsFn(tenantId, attachmentIds)
    },

    async getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]> {
      return getAttachmentViewUrlsFn(tenantId, attachments)
    },
    instructUser(userInstruction: UserInstruction): void {
      userInstructionStoreFns.add(userInstruction)
    },
    getModelViews(modelId: ModelId): ModelView[] {
      throw new Error('Not implemented')
    },
    async saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
      throw new Error('Not implemented')
    },
  }
  return paginatedEditorHost
}
