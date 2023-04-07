import type {
  DataRecord,
  DataRecordId,
  ModelId,
  ModelPath,
  ModelPathElement,
} from '@cozemble/model-core'
import { type ReferencedRecords, referencedRecordsFns } from '@cozemble/model-core'
import { cozauth } from '../auth/cozauth'
import { config } from '../config'
import type { EventSourcedDataRecordOption } from '@cozemble/data-editor-sdk'
import { dataRecordEditEvents, eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import { mandatory } from '@cozemble/lang-util'
import { dataRecordValuePathFns } from '@cozemble/model-api'

export async function referencingRecordsHelper(
  tenantId: string,
  recordId: DataRecordId, // Customer
  referencingModelId: ModelId, // Booking
): Promise<DataRecord[]> {
  const accessToken = await cozauth.getAccessToken(cozauth.getTenantRoot(tenantId))
  if (!accessToken) {
    throw new Error('Failed to get accessToken')
  }
  const url = `${config.backendUrl()}/api/v1/tenant/${tenantId}/model/${
    referencingModelId.value
  }/referencing/${recordId.value}`
  const recordsResponse = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!recordsResponse.ok) {
    throw new Error(
      `Failed to fetch records at ${url}: ${recordsResponse.status} ${recordsResponse.statusText}`,
    )
  }
  const json = await recordsResponse.json()
  return mandatory(json.records, 'Missing records in response')
}

export function makeOnNewRecord(
  pathsReferencingTargetModel: ModelPath<ModelPathElement>[],
  targetRecord: DataRecord,
): EventSourcedDataRecordOption {
  const targetModelPath = mandatory(
    pathsReferencingTargetModel[0],
    `No path referencing target model`,
  )
  if (targetModelPath.lastElement._type !== 'model.reference') {
    throw new Error(`Path ${targetModelPath} does not reference model`)
  }
  const targetRecordPath = dataRecordValuePathFns.fromModelPath(targetModelPath)
  const reference: ReferencedRecords = referencedRecordsFns.oneReference(
    targetRecord.modelId,
    targetRecord.id,
  )
  return (record) => {
    const event = dataRecordEditEvents.valueChanged(
      record.record,
      targetRecordPath,
      null,
      reference,
      null,
    )
    return eventSourcedDataRecordFns.addEvent(event, record)
  }
}
