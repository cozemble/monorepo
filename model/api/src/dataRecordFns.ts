import { clock, uuids } from '@cozemble/lang-util'
import { type DataRecord, type Model, propertyDescriptors } from '@cozemble/model-core'
import { modelFns } from './modelsFns'

export const dataRecordFns = {
  newInstance: (model: Model, creatorId: string): DataRecord => {
    return {
      _type: 'data.record',
      id: {
        _type: 'data.record.id',
        value: uuids.v4(),
      },
      createdBy: { _type: 'user.id', value: creatorId },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      modelId: model.id,
      values: {},
    }
  },
  fullStructure(
    models: Model[],
    dataRecord: DataRecord,
    createdBy = dataRecord.createdBy,
  ): DataRecord {
    const model = modelFns.findById(models, dataRecord.modelId)
    return model.relationships.reduce((acc, rel) => {
      if (rel._type === 'relationship') {
        if (rel.subType === 'has.one.relationship') {
          if (!acc.values[rel.id.value]) {
            acc.values[rel.id.value] = dataRecordFns.newInstance(
              modelFns.findById(models, rel.modelId),
              createdBy.value,
            )
          }
          acc.values[rel.id.value] = this.fullStructure(models, acc.values[rel.id.value])
        } else {
          if (!acc.values[rel.id.value]) {
            acc.values[rel.id.value] = []
          } else {
            acc.values[rel.id.value] = acc.values[rel.id.value].map((r: DataRecord) =>
              this.fullStructure(models, r),
            )
          }
        }
      }
      return acc
    }, dataRecord)
  },
  random: (models: Model[], model: Model, givenValues: { [key: string]: any } = {}): DataRecord => {
    let record: DataRecord = {
      _type: 'data.record',
      id: { _type: 'data.record.id', value: uuids.v4() },
      modelId: model.id,
      createdBy: { _type: 'user.id', value: 'random' },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      values: {},
    }
    record = model.properties.reduce((record, property) => {
      const givenValue = givenValues[property.name.value]
      const hasGivenValue = givenValue !== undefined
      const value = hasGivenValue
        ? givenValue
        : propertyDescriptors.mandatory(property).randomValue()
      return modelFns.setPropertyValue(model, property, value, record)
    }, record)
    record = model.relationships.reduce((record, relationship) => {
      if (
        relationship._type === 'relationship' &&
        relationship.subType === 'has.one.relationship'
      ) {
        const givenValue = givenValues[relationship.name.value]
        if (givenValue) {
          if (givenValue._type === 'data.record') {
            record.values[relationship.id.value] = givenValue
          } else {
            const relatedModel = modelFns.findById(models, relationship.modelId)
            record.values[relationship.id.value] = dataRecordFns.random(
              models,
              relatedModel,
              givenValue,
            )
          }
        }
      }
      return record
    }, record)
    return record
  },
}
