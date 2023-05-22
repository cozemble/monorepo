import type { RecordsContext } from '../records/RecordsContext'
import type { DataRecordEditorClient, UploadedAttachment } from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId, Model, ModelView } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { DataRecordControlEvent, DataRecordEditEvent } from '@cozemble/model-event-sourced'
import type { RecordGraph } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced/dist/esm'

export function makeDataRecordEditorClient(
  context: RecordsContext,
  recordId: DataRecordId,
): DataRecordEditorClient {
  return {
    recordById(): Promise<DataRecord | null> {
      throw new Error('Not implemented')
    },

    dispatchControlEvent(event: DataRecordControlEvent): void {
      console.log({ event })
    },

    dispatchEditEvent(event: DataRecordEditEvent): void {
      if (event._type === 'data.record.value.changed') {
        context.updateRecord(recordId, event)
        if (event.confirmMethod === 'Tab') {
          context.getFocusControls().moveForward()
        }
      } else {
        throw new Error('Not implemented: ' + event._type)
      }
    },

    createNewRootRecord(): Promise<EventSourcedRecordGraph | null> {
      throw new Error('Method not implemented.')
    },

    searchRecords(): Promise<DataRecord[]> {
      throw new Error('Method not implemented.')
    },

    getModels(): Model[] {
      throw new Error('Method not implemented.')
    },

    getModelViews(): ModelView[] {
      throw new Error('Method not implemented.')
    },

    saveModelView(): Promise<JustErrorMessage | null> {
      throw new Error('Not implemented')
    },

    uploadAttachments(): Promise<UploadedAttachment[]> {
      throw new Error('Method not implemented.')
    },

    deleteAttachments(): Promise<void> {
      throw new Error('Method not implemented.')
    },

    getAttachmentViewUrls(): Promise<string[]> {
      throw new Error('Method not implemented.')
    },

    instructUser(): void {
      throw new Error('Method not implemented.')
    },
  }
}
