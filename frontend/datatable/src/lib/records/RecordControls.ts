import type { DataRecordId } from '@cozemble/model-core'

export interface RecordControls {
  saveRecord(record: DataRecordId): Promise<void>
}
