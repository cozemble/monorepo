import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { RecordDeleteOutcome } from '@cozemble/data-paginated-editor'
import type { RecordSaveOutcome } from '@cozemble/data-paginated-editor'
import type { DataRecord, Model } from '@cozemble/model-core'
import { backend } from '../backend/backendStore'

export async function saveRecord(
  tenantId: string,
  models: Model[],
  newRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  return backend.saveRecord(tenantId, models, newRecord)
}

export async function deleteRecord(
  tenantId: string,
  modelId: string,
  record: DataRecord,
): Promise<RecordDeleteOutcome> {
  return backend.deleteRecord(tenantId, modelId, record)
}
