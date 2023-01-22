import type { DataRecord, Model, ModelId } from '@cozemble/model-core'
import { DataRecordEditEvent, dataRecordEditEvents } from './dataRecordEditEvents'
import { dataRecordFns, dataRecordPathFns, modelFns } from '@cozemble/model-api'

export interface EventSourcedDataRecord {
  _type: 'event.sourced.daya.record'
  models: Model[]
  record: DataRecord
  events: DataRecordEditEvent[]
}

function applyEvent(models: Model[], event: DataRecordEditEvent, record: DataRecord): DataRecord {
  if (event._type === 'data.record.value.changed') {
    return dataRecordPathFns.setValue(models, event.path, record, event.newValue)
  }
  if (event._type === 'data.record.has.many.item.added') {
    return dataRecordPathFns.addHasManyItem(
      models,
      event.parentPath,
      event.relationship,
      record,
      event.newRecord,
    )
  }
  return record
}

export const eventSourcedDataRecordFns = {
  newInstance(models: Model[], modelId: ModelId, creatorId: string): EventSourcedDataRecord {
    const model = modelFns.findById(models, modelId)
    const record = dataRecordFns.fullStructure(models, dataRecordFns.newInstance(model, creatorId))
    return {
      _type: 'event.sourced.daya.record',
      models,
      record,
      events: [dataRecordEditEvents.recordCreated(modelId, record.id, creatorId)],
    }
  },
  fromRecord(models: Model[], record: DataRecord): EventSourcedDataRecord {
    return {
      _type: 'event.sourced.daya.record',
      models,
      record,
      events: [],
    }
  },
  addEvent(event: DataRecordEditEvent, record: EventSourcedDataRecord): EventSourcedDataRecord {
    return {
      ...record,
      record: applyEvent(record.models, event, record.record),
      events: [...record.events, event],
    }
  },
}
