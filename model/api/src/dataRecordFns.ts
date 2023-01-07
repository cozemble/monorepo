import { clock, uuids } from '@cozemble/lang-util'
import { type DataRecord, type Model, propertyDescriptors } from '@cozemble/model-core'
import { modelFns } from './modelsFns'

export const dataRecordFns = {
  newInstance: (model: Model, creatorId: string): DataRecord => {
    return {
      _type: 'data.record',
      id: {
        _type: 'data.record.id',
        id: uuids.v4(),
      },
      createdBy: { _type: 'user.id', id: creatorId },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      modelId: model.id,
      values: {},
    }
  },
  random: (model: Model, givenValues: { [key: string]: any }): DataRecord => {
    const record: DataRecord = {
      _type: 'data.record',
      id: { _type: 'data.record.id', id: uuids.v4() },
      modelId: model.id,
      createdBy: { _type: 'user.id', id: 'random' },
      createdMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      updatedMillis: { _type: 'timestamp.epoch.millis', value: clock.now().getTime() },
      values: {},
    }
    return model.properties.reduce((record, property) => {
      const value =
        givenValues[property.name.value] || propertyDescriptors.mandatory(property).randomValue()
      return modelFns.setPropertyValue(model, property, value, record)
    }, record)
  },
}
