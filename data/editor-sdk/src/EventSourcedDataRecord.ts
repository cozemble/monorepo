import type { DataRecord, Model, ModelId } from '@cozemble/model-core'
import { SystemConfiguration } from '@cozemble/model-core'
import { DataRecordEditEvent, dataRecordEditEvents } from './dataRecordEditEvents'
import { dataRecordFns, dataRecordValuePathFns, modelFns } from '@cozemble/model-api'
import { Option } from '@cozemble/lang-util'

export interface EventSourcedDataRecord {
  _type: 'event.sourced.data.record'
  models: Model[]
  record: DataRecord
  events: DataRecordEditEvent[]
}

function applyEvent(
  systemConfiguration: SystemConfiguration,
  models: Model[],
  event: DataRecordEditEvent,
  record: DataRecord,
): DataRecord {
  if (event._type === 'data.record.value.changed') {
    return dataRecordValuePathFns.setValue(
      systemConfiguration,
      models,
      event.path,
      record,
      event.newValue,
    )
  }
  if (event._type === 'data.record.has.many.item.added') {
    return dataRecordValuePathFns.addHasManyItem(
      models,
      event.parentPath,
      event.nestedModel,
      record,
      event.newRecord,
    )
  }
  return record
}

export type EventSourcedDataRecordOption = Option<EventSourcedDataRecord>

export const eventSourcedDataRecordFns = {
  newInstance(models: Model[], modelId: ModelId, creatorId: string): EventSourcedDataRecord {
    const model = modelFns.findById(models, modelId)
    const record = dataRecordFns.fullStructure(models, dataRecordFns.newInstance(model, creatorId))
    return {
      _type: 'event.sourced.data.record',
      models,
      record,
      events: [dataRecordEditEvents.recordCreated(modelId, record.id, creatorId)],
    }
  },
  fromRecord(models: Model[], record: DataRecord): EventSourcedDataRecord {
    return {
      _type: 'event.sourced.data.record',
      models,
      record,
      events: [],
    }
  },
  addEvent(
    systemConfiguration: SystemConfiguration,
    event: DataRecordEditEvent,
    record: EventSourcedDataRecord,
  ): EventSourcedDataRecord {
    return {
      ...record,
      record: applyEvent(systemConfiguration, record.models, event, record.record),
      events: [...record.events, event],
    }
  },
  applyOptions(
    record: EventSourcedDataRecord,
    ...options: EventSourcedDataRecordOption[]
  ): EventSourcedDataRecord {
    return options.reduce((r, o) => o(r), record)
  },
}
