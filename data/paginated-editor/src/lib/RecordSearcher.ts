import type { DataRecord, DataRecordId, ModelId } from '@cozemble/model-core'

export interface RecordSearcher {
  searchRecords(modelId: ModelId, searchTerm: string): Promise<DataRecord[]>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<DataRecord | null>
}
