import type {
  AttachmentIdAndFileName,
  DataRecordControlEvent,
  DataRecordEditEvent,
  DataRecordEditorClient,
  DataRecordViewerClient,
  UploadedAttachment,
  UserInstruction,
} from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId, Model, ModelId, ModelView } from '@cozemble/model-core'
import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'
import type { DataTableFocusControls2 } from '../focus/DataTableFocus'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { Backend } from '../backend/Backend'
import { createNewRecord as createNewRecordFn } from './creator/recordCreatorStore'

export type CombinedDataRecordEditorClient = DataRecordEditorClient & DataRecordViewerClient

export function makeCombinedDataRecordEditorClient(
  backend: Backend,
  modelsProvider: () => Model[],
  modelViewsProvider: () => ModelView[],
  records: EventSourcedDataRecordsStore,
  focusControls: DataTableFocusControls2,
  recordId: DataRecordId,
): CombinedDataRecordEditorClient {
  return {
    dispatchControlEvent(event: DataRecordControlEvent): void {
      if (event._type === 'data.record.edit.move.focus') {
        if (event.direction === 'right') {
          focusControls.moveForward()
        }
      }
      if (event._type === 'data.record.edit.aborted') {
        focusControls.clearFocus()
      }
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
      return new Promise((resolve) => {
        function onCreated(value: DataRecord): void {
          resolve(value)
        }

        function onCancel(): void {
          resolve(null)
        }

        createNewRecordFn(modelId, onCreated, onCancel)
      })
    },

    searchRecords(modelId: ModelId, search: string): Promise<DataRecord[]> {
      return backend.searchRecords(modelId, search)
    },

    getModels(): Model[] {
      return modelsProvider()
    },

    getModelViews(modelId: ModelId): ModelView[] {
      return modelViewsProvider()
    },

    saveModelView(modelView: ModelView): Promise<JustErrorMessage | null> {
      return backend.saveModelView(modelView)
    },

    uploadAttachments(
      files: File[],
      progressUpdater: (percent: number) => void,
    ): Promise<UploadedAttachment[]> {
      return backend.uploadAttachments(files, progressUpdater)
    },

    deleteAttachments(attachmentIds: string[]): Promise<void> {
      return backend.deleteAttachments(attachmentIds)
    },

    getAttachmentViewUrls(attachments: AttachmentIdAndFileName[]): Promise<string[]> {
      return backend.getAttachmentViewUrls(attachments)
    },

    instructUser(userInstruction: UserInstruction): void {
      throw new Error('Method not implemented.')
    },

    recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
      return backend.recordById(modelId, recordId)
    },
  }
}
