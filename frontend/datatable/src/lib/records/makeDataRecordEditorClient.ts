import type {
  AttachmentIdAndFileName,
  DataRecordControlEvent,
  DataRecordEditEvent,
  DataRecordEditorClient,
  UploadedAttachment,
  UserInstruction,
} from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId, Model, ModelId, ModelView } from '@cozemble/model-core'
import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'
import type { DataTableFocusControls2 } from '../focus/DataTableFocus'

export function makeDataRecordEditorClient(
  records: EventSourcedDataRecordsStore,
  focusControls: DataTableFocusControls2,
  recordId: DataRecordId,
): DataRecordEditorClient {
  return {
    dispatchControlEvent(event: DataRecordControlEvent): void {
      console.log({ event })
    },

    dispatchEditEvent(event: DataRecordEditEvent): void {
      if (event._type === 'data.record.value.changed') {
        records.updateRecord(recordId, event)
        if (event.confirmMethod === 'Tab') {
          focusControls.moveForward()
        }
      } else {
        throw new Error('Not implemented: ' + event._type)
      }
    },

    createNewRecord(modelId: ModelId): Promise<DataRecord | null> {
      throw new Error('Method not implemented.')
    },

    searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
      throw new Error('Method not implemented.')
    },

    getModels(): Model[] {
      throw new Error('Method not implemented.')
    },

    getModelViews(modelId: ModelId): ModelView[] {
      throw new Error('Method not implemented.')
    },

    uploadAttachments(
      files: File[],
      progressUpdater: (percent: number) => void,
    ): Promise<UploadedAttachment[]> {
      throw new Error('Method not implemented.')
    },

    deleteAttachments(attachmentIds: string[]): Promise<void> {
      throw new Error('Method not implemented.')
    },

    getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]> {
      throw new Error('Method not implemented.')
    },

    instructUser(userInstruction: UserInstruction): void {
      throw new Error('Method not implemented.')
    },
  }
}
