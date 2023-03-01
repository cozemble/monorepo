import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import {
  recordSaveFailed,
  type RecordSaveOutcome,
  recordSaveSucceeded,
} from '@cozemble/data-paginated-editor'
import { config } from '../config'

export async function saveRecord(
  tenantId: string,
  modelId: string,
  newRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  const saveResponse = await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([newRecord.record]),
    },
  )
  if (saveResponse.ok) {
    return recordSaveSucceeded(newRecord.record)
  } else {
    return recordSaveFailed([saveResponse.statusText], new Map())
  }
}
