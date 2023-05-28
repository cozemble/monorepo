import type { ModelId } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'

export interface RecordCreator {
  createNewRecord(modelId: ModelId): Promise<EventSourcedRecordGraph | null>
}
