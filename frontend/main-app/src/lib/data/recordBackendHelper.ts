import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import {
  recordSaveFailed,
  type RecordSaveOutcome,
  recordSaveSucceeded,
} from '@cozemble/data-paginated-editor'
import { config } from '../config'
import type { DataRecord } from '@cozemble/model-core'
import { cozauth } from '../auth/cozauth'
import type { RecordDeleteOutcome } from '@cozemble/data-paginated-editor'
import { justErrorMessage } from '@cozemble/lang-util'

export async function saveRecord(
  tenantId: string,
  modelId: string,
  newRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  const saveResponse = await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

export async function deleteRecord(
  tenantId: string,
  modelId: string,
  record: DataRecord,
): Promise<RecordDeleteOutcome> {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  const recordId = record.id.value
  const saveResponse = await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record/${recordId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  )
  if (saveResponse.ok) {
    return recordSaveSucceeded(record)
  } else {
    return justErrorMessage(`Failed to delete record: ${saveResponse.statusText}`)
  }
}
