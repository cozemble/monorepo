import type { DataRecord, ModelId } from '@cozemble/model-core'

export interface RecordSearcher {
  searchRecords(modelId: ModelId, searchTerm: string): Promise<DataRecord[]>
}
