import type {
  AttachmentIdAndFileName,
  DataRecordEditEventMaker,
  DataRecordEditorClient,
  DataRecordViewerClient,
  UploadedAttachment,
} from '@cozemble/data-editor-sdk'
import type {
  DataRecord,
  DataRecordId,
  Model,
  ModelId,
  ModelView,
  SystemConfiguration,
} from '@cozemble/model-core'
import type { EventSourcedRecordGraphStore } from './EventSourcedRecordGraphStore'
import type { DataTableFocusControls2 } from '../focus/DataTableFocus'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { Backend } from '../backend/Backend'
import { createNewRootRecord as createNewRootRecordFn } from './creator/recordCreatorStore'
import type { DataRecordControlEvent, DataRecordEditEvent } from '@cozemble/model-event-sourced'
import { eventSourcedDataRecordFns } from '@cozemble/model-event-sourced'
import { mandatory } from '@cozemble/lang-util/dist/esm'

export type CombinedDataRecordEditorClient = DataRecordEditorClient & DataRecordViewerClient

export function makeCombinedDataRecordEditorClient(
  backend: Backend,
  systemConfigProvider: () => SystemConfiguration,
  modelsProvider: () => Model[],
  modelViewsProvider: () => ModelView[],
  records: EventSourcedRecordGraphStore,
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
      } else if (event._type === 'data.record.has.many.item.added') {
        records.updateRecord(recordId, event)
      } else {
        throw new Error('Not implemented: ' + event._type)
      }
    },

    async createNewRootRecord(
      modelId: ModelId,
      ...eventMakers: DataRecordEditEventMaker[]
    ): Promise<DataRecord | null> {
      let newRecord = await createNewRootRecordFn(modelId)
      if (!newRecord) {
        return null
      }
      const record = mandatory(newRecord.record, `newRecord.record`)
      const events = eventMakers.flatMap((eventMaker) => eventMaker(record))
      newRecord = eventSourcedDataRecordFns.addEvents(systemConfigProvider(), newRecord, ...events)
      const outcome = await backend.saveNewRecord(newRecord)
      if (outcome._type === 'record.save.succeeded') {
        return outcome.record
      }
      return null
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

    instructUser(): void {
      throw new Error('Method not implemented.')
    },

    recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null> {
      return backend.recordById(modelId, recordId)
    },
  }
}
