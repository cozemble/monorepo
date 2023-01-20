import { dataRecordEditEvents } from '@cozemble/data-editor-sdk'
import { dataRecordPathFns, modelFns, testExports } from '@cozemble/model-api'
import type { DataRecord } from '@cozemble/model-core'

const invoiceModels = testExports.invoiceModels

export function valueChanged(record: DataRecord, value: string, ...pathNames: string[]) {
  const model = modelFns.findById(invoiceModels, record.modelId)
  return dataRecordEditEvents.valueChanged(
    record,
    dataRecordPathFns.fromNames(invoiceModels, model, ...pathNames),
    null,
    value,
    null,
  )
}
