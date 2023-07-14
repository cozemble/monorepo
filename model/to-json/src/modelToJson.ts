import { DataRecord, Model } from '@cozemble/model-core'
import { modelFns } from '@cozemble/model-api'

export function modelToJson(models: Model[], record: DataRecord): any {
  const model = modelFns.findById(models, record.modelId)
  const withProperties = modelFns.properties(model).reduce((json: any, property: any) => {
    const value = record.values[property.id.value]
    if (value === undefined) return json
    return {
      ...json,
      [property.name.value]: value,
    }
  }, {})
  return model.nestedModels.reduce((json: any, relationship: any) => {
    const value = record.values[relationship.id.value]
    if (value === undefined) return json
    if (relationship.cardinality === 'one') {
      return {
        ...json,
        [relationship.name.value]: modelToJson(models, value),
      }
    } else {
      return {
        ...json,
        [relationship.name.value]: value.map((record: DataRecord) => modelToJson(models, record)),
      }
    }
  }, withProperties)
}
