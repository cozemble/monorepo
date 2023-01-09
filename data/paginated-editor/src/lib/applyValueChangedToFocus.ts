import { dataRecordPathFns, modelFns, modelPathFns } from '@cozemble/model-api'
import type { DataRecordPath, Model, ModelPath, Property } from '@cozemble/model-core'
import type { DataRecord } from '@cozemble/model-core/dist/esm'
import type { DataRecordValueChanged } from '@cozemble/model-editor-sdk'

export function applyValueChangedToFocus(
  focus: DataRecordPath,
  models: Model[],
  record: DataRecord,
  event: DataRecordValueChanged,
): DataRecordPath | null {
  if (event.confirmMethod === 'Tab') {
    const model = modelFns.findById(models, record.modelId)
    const allPaths = modelFns
      .allPaths(models, model)
      .filter((p) => p.lastElement._type === 'property') as ModelPath<Property>[]
    const allValues = allPaths.flatMap((p) => modelPathFns.getValues(models, p, record))
    const indexOfFocus = allValues.findIndex((v) =>
      dataRecordPathFns.sameDottedPaths(v.path, focus),
    )
    const nextValue = allValues[indexOfFocus + 1]
    return nextValue ? nextValue.path : null
  }
  return focus
}
