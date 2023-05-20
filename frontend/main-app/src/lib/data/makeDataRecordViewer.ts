import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { DataRecordEditEvent, EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { eventSourcedDataRecordFns } from '@cozemble/model-event-sourced'
import type { Model, ModelView, SystemConfiguration } from '@cozemble/model-core'
import type {
  AttachmentsManager,
  RecordSaveOutcome,
  RecordSearcher,
} from '@cozemble/data-paginated-editor'

export function makeDataRecordViewer(
  systemConfiguration: SystemConfiguration,
  models: Model[],
  modelViews: ModelView[],
  recordSearcher: RecordSearcher,
  attachmentsManager: AttachmentsManager,
  onEditedRecord: (editedRecord: EventSourcedDataRecord) => Promise<RecordSaveOutcome>,
  onError: (error: Error) => void,
): DataRecordViewerClient {
  function dispatchEditEvent(event: DataRecordEditEvent): void {
    if (event._type === 'data.record.value.changed') {
      let eventSourced = eventSourcedDataRecordFns.fromRecord(models, event.record)
      eventSourced = eventSourcedDataRecordFns.addEvent(systemConfiguration, event, eventSourced)
      onEditedRecord(eventSourced).catch(onError)
    } else {
      throw new Error('Not implemented: ' + event._type)
    }
  }

  return {
    getModelViews: () => modelViews,
    getModels: () => models,
    recordById: recordSearcher.recordById,
    getAttachmentViewUrls: attachmentsManager.getAttachmentViewUrls,
    dispatchEditEvent,
    instructUser: (userInstruction) => {
      throw new Error('Not implemented')
    },
    saveModelView: () => {
      throw new Error('Not implemented')
    },
    searchRecords: () => {
      throw new Error('Not implemented')
    },
  }
}
