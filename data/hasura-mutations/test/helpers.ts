import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordPathFns, modelFns, testExports } from '@cozemble/model-api'
import type { DataRecord } from '@cozemble/model-core'

const invoiceModels = testExports.invoiceModels

export function valueChanged(
  rootRecord: DataRecord,
  changedRecord: DataRecord,
  value: string,
  ...pathNames: string[]
) {
  const rootRecordModel = modelFns.findById(invoiceModels, rootRecord.modelId)
  return dataRecordEditEvents.valueChanged(
    changedRecord,
    dataRecordPathFns.fromNames(invoiceModels, rootRecordModel, ...pathNames),
    null,
    value,
    null,
  )
}
