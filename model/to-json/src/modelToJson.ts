import { DataRecord, Model } from '@cozemble/model-core'
import { modelFns } from '@cozemble/model-api'

export function modelToJson(models: Model[], record: DataRecord): any {
  const model = modelFns.findById(models, record.modelId)
  const withProperties = model.properties.reduce((json, property) => {
    const value = record.values[property.id.value]
    if (value === undefined) return json
    return {
      ...json,
      [property.name.value]: value,
    }
  }, {})
  return model.relationships.reduce((json, relationship) => {
    const value = record.values[relationship.id.value]
    if (value === undefined) return json
    if (relationship.subType === 'has.one.relationship') {
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
