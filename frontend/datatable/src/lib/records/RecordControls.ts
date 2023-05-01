import type { DataRecordId } from '@cozemble/model-core'

export interface RecordControls {
  addNewRecord(): DataRecordId

  saveRecord(record: DataRecordId): Promise<void>
}
