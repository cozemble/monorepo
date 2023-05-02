import type { PaginatedEditorHost } from './PaginatedEditorHost'
import type {
  DataRecordEditEvent,
  DataRecordViewerClient,
  EventSourcedDataRecord,
} from '@cozemble/data-editor-sdk'
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import type { Model, ModelView, SystemConfiguration } from '@cozemble/model-core'
import type { RecordSaveOutcome } from './RecordEditContext'

export function makeDataRecordViewer(
  systemConfiguration: SystemConfiguration,
  models: Model[],
  modelViews: ModelView[],
  paginatedEditorHost: PaginatedEditorHost,
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
    recordById: paginatedEditorHost.recordById,
    saveModelView: paginatedEditorHost.saveModelView,
    searchRecords: paginatedEditorHost.searchRecords,
    getAttachmentViewUrls: paginatedEditorHost.getAttachmentViewUrls,
    dispatchEditEvent,
    instructUser: paginatedEditorHost.instructUser,
  }
}
