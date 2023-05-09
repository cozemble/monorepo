import type { DataRecordId } from '@cozemble/model-core'
import type { JustErrorMessage } from '@cozemble/lang-util'

export interface RecordControls {
  addNewRecord(): DataRecordId

  saveRecord(record: DataRecordId): Promise<JustErrorMessage | null>

  saveNewRecord(record: DataRecordId): Promise<JustErrorMessage | null>
}
