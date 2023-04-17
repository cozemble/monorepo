import type {
  DataRecord,
  DataRecordId,
  ModelId,
  ModelPath,
  ModelPathElement,
  SystemConfiguration,
} from '@cozemble/model-core'
import { type ReferencedRecords, referencedRecordsFns } from '@cozemble/model-core'
import type { EventSourcedDataRecordOption } from '@cozemble/data-editor-sdk'
import { dataRecordEditEvents, eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import { mandatory } from '@cozemble/lang-util'
import { dataRecordValuePathFns } from '@cozemble/model-api'
import { backend } from '../backend/backendStore'

export async function referencingRecordsHelper(
  tenantId: string,
  recordId: DataRecordId, // Customer
  referencingModelId: ModelId, // Booking
): Promise<DataRecord[]> {
  return backend.referencingRecords(tenantId, recordId, referencingModelId)
}

export function makeOnNewRecord(
  systemConfiguration: SystemConfiguration,
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
    return eventSourcedDataRecordFns.addEvent(systemConfiguration, event, record)
  }
}
