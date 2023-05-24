import type { DataRecordId, ModelId, RecordAndEdges, RecordsAndEdges } from '@cozemble/model-core'

export interface RecordSearcher {
  searchRecords(modelId: ModelId, searchTerm: string): Promise<RecordsAndEdges>

  recordById(modelId: ModelId, recordId: DataRecordId): Promise<RecordAndEdges | null>
}
