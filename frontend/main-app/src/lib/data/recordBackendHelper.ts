import type { EventSourcedDataRecord } from '@cozemble/model-event-sourced'
import type { RecordDeleteOutcome, RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { DataRecord, Id, Model, RecordGraphEdge } from '@cozemble/model-core'
import { backend } from '../backend/backendStore'

export async function saveRecord(
  tenantId: string,
  models: Model[],
  newRecord: EventSourcedDataRecord,
  edges: RecordGraphEdge[],
  deletedEdges: Id[],
): Promise<RecordSaveOutcome> {
  return backend.saveRecord(tenantId, models, newRecord, edges, deletedEdges)
}

export async function deleteRecord(
  tenantId: string,
  modelId: string,
  record: DataRecord,
): Promise<RecordDeleteOutcome> {
  return backend.deleteRecord(tenantId, modelId, record)
}
