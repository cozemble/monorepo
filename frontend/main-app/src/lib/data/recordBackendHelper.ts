import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { RecordDeleteOutcome } from '@cozemble/data-paginated-editor'
import {
  recordSaveFailed,
  type RecordSaveOutcome,
  recordSaveSucceeded,
} from '@cozemble/data-paginated-editor'
import { config } from '../config'
import type { DataRecord, Model } from '@cozemble/model-core'
import { cozauth } from '../auth/cozauth'
import { justErrorMessage } from '@cozemble/lang-util'
import type { ConflictErrorType } from '@cozemble/backend-tenanted-api-types'
import { savableRecords } from '@cozemble/backend-tenanted-api-types'
import { dataRecordValuePathFns, modelFns } from '@cozemble/model-api'
import type { DataRecordValuePath } from '@cozemble/model-core'

export async function saveRecord(
  tenantId: string,
  models: Model[],
  newRecord: EventSourcedDataRecord,
): Promise<RecordSaveOutcome> {
  const modelId = newRecord.record.modelId.value
  const model = modelFns.findById(models, newRecord.record.modelId)
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  const saveResponse = await fetch(
    `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${modelId}/record`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(savableRecords([newRecord.record])),
    },
  )
  if (saveResponse.ok) {
    return recordSaveSucceeded(newRecord.record)
  } else {
    const response = await saveResponse.json()
    if (response._type === 'error.conflict') {
      const conflict: ConflictErrorType = response
      const valuePath = dataRecordValuePathFns.fromIds(
        models,
        model,
        ...conflict.conflictingPath.split('.'),
      )
      const valueErrors: Map<DataRecordValuePath, string[]> = new Map()
      valueErrors.set(valuePath, ['Must be unique'])
      return recordSaveFailed([`Failed to save record, has non unique values`], valueErrors)
    }
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
