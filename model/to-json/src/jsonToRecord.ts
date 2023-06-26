import { DataRecord, Model } from '@cozemble/model-core'
import { strings } from '@cozemble/lang-util'
import { dataRecordFns, modelFns } from '@cozemble/model-api'

export function jsonToRecord(
  models: Model[],
  model: Model,
  creatorId: string,
  json: Record<string, any>,
): DataRecord {
  return Object.entries(json).reduce((record, [key, value]) => {
    const maybeSlot = model.slots.find((s) => strings.toJsonCase(s.name.value) === key)
    if (maybeSlot) {
      if (maybeSlot._type === 'property') {
        record.values[maybeSlot.id.value] = value
        return record
      }
    }
    const maybeNested = model.nestedModels.find((s) => strings.toJsonCase(s.name.value) === key)
    if (maybeNested) {
      const nestedModel = modelFns.findById(models, maybeNested.modelId)
      if (maybeNested.cardinality === 'one') {
        record.values[maybeNested.id.value] = jsonToRecord(models, nestedModel, creatorId, value)
      } else {
        record.values[maybeNested.id.value] = value.map((v: any) =>
          jsonToRecord(models, nestedModel, creatorId, v),
        )
      }
      return record
    }
    return record
  }, dataRecordFns.newInstance(model, creatorId))
}
