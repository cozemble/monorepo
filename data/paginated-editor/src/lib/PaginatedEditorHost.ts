import type { RecordSaveOutcome, RecordSaveSucceeded } from '$lib/RecordEditContext'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { DataRecord } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'

export type RecordDeleteOutcome = RecordSaveSucceeded | JustErrorMessage

export interface PaginatedEditorHost {
  recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome>
}
