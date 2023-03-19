import type { DataRecord, ModelId } from '@cozemble/model-core'

export interface RecordCreator {
  createNewRecord(modelId: ModelId): Promise<DataRecord | null>
}
