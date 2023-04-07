import type {
  DataRecordEditEvent,
  DataRecordViewerClient,
  EventSourcedDataRecord,
} from '@cozemble/data-editor-sdk'
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import type { Model, ModelView } from '@cozemble/model-core'
import type {
  AttachmentsManager,
  RecordSaveOutcome,
  RecordSearcher,
} from '@cozemble/data-paginated-editor'
import type { SystemConfiguration } from '@cozemble/model-core'

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
  }
}
