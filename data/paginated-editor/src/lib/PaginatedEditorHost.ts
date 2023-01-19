import type { RecordSaveOutcome } from '$lib/RecordEditContext'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'

export interface PaginatedEditorHost {
  recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>
}
