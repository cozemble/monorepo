import type { RecordSaveOutcome, RecordSaveSucceeded } from './RecordEditContext'
import type { EventSourcedDataRecord, UserInstruction } from '@cozemble/data-editor-sdk'
import type { DataRecord } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'
import type { RecordSearcher } from './RecordSearcher'
import type { AttachmentsManager } from './AttachmentsManager'
import type { ModelViewManager } from '@cozemble/data-editor-sdk/dist/esm/ModelViewManager'

export type RecordDeleteOutcome = RecordSaveSucceeded | JustErrorMessage

export interface PaginatedEditorHost extends RecordSearcher, AttachmentsManager, ModelViewManager {
  recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome>

  deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome>

  viewRecord(record: DataRecord, viewNow: boolean): void

  instructUser(userInstruction: UserInstruction): void
}
