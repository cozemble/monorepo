import type { PaginatedEditorHost } from './PaginatedEditorHost'
import type { DataRecordViewerClient } from '@cozemble/data-editor-sdk'
import type { Model, ModelView, SystemConfiguration } from '@cozemble/model-core'
import type { RecordSaveOutcome } from './RecordEditContext'
import type { DataRecordEditEvent, EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import { eventSourcedDataRecordFns } from '@cozemble/model-event-sourced'

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
