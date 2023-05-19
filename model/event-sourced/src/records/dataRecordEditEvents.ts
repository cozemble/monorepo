import type {
  DataRecord,
  DataRecordId,
  DataRecordPathParentElement,
  DataRecordValuePath,
  ModelId,
} from '@cozemble/model-core'
import { NestedModel } from '@cozemble/model-core'
import { timestampEpochMillis, TimestampEpochMillis } from '@cozemble/model-core'

export interface DataRecordCreatedEvent {
  _type: 'data.record.created'
  timestamp: TimestampEpochMillis
  modelId: ModelId
  recordId: DataRecordId
  creatorId: string
}

function dataRecordCreatedEvent(
  modelId: ModelId,
  recordId: DataRecordId,
  creatorId: string,
): DataRecordCreatedEvent {
  return {
    _type: 'data.record.created',
    timestamp: timestampEpochMillis(),
    modelId,
    recordId,
    creatorId,
  }
}

export interface DataRecordDeletedEvent {
  _type: 'data.record.deleted'
  timestamp: TimestampEpochMillis
  modelId: ModelId
  recordId: DataRecordId
  deleterId: string
}

export function dataRecordDeletedEvent(
  modelId: ModelId,
  recordId: DataRecordId,
  deleterId: string,
): DataRecordDeletedEvent {
  return {
    _type: 'data.record.deleted',
    timestamp: timestampEpochMillis(),
    modelId,
    recordId,
    deleterId,
  }
}

export interface DataRecordEditAborted {
  _type: 'data.record.edit.aborted'
  record: DataRecord
  path: DataRecordValuePath
}

export interface DataRecordEditMoveFocus {
  _type: 'data.record.edit.move.focus'
  record: DataRecord
  path: DataRecordValuePath
  direction: 'left' | 'right'
}

export interface DataRecordValueChanged<T = any> {
  _type: 'data.record.value.changed'
  timestamp: TimestampEpochMillis
  record: DataRecord
  path: DataRecordValuePath
  oldValue: T | null
  newValue: T | null
  confirmMethod: 'Enter' | 'Tab' | null
}

export interface HasManyItemAdded {
  _type: 'data.record.has.many.item.added'
  timestamp: TimestampEpochMillis
  record: DataRecord
  parentPath: DataRecordPathParentElement[]
  nestedModel: NestedModel
  newRecord: DataRecord
}

export type DataRecordEditEvent =
  | DataRecordValueChanged
  | HasManyItemAdded
  | DataRecordCreatedEvent
  | DataRecordDeletedEvent

export type DataRecordControlEvent = DataRecordEditAborted | DataRecordEditMoveFocus

export const dataRecordControlEvents = {
  editAborted(record: DataRecord, path: DataRecordValuePath): DataRecordEditAborted {
    return {
      _type: 'data.record.edit.aborted',
      record,
      path,
    }
  },
  moveFocus(
    record: DataRecord,
    path: DataRecordValuePath,
    direction: 'left' | 'right',
  ): DataRecordEditMoveFocus {
    return {
      _type: 'data.record.edit.move.focus',
      record,
      path,
      direction,
    }
  },
}
export const dataRecordEditEvents = {
  recordCreated: dataRecordCreatedEvent,
  recordDeleted: dataRecordDeletedEvent,
  valueChanged<T>(
    record: DataRecord,
    path: DataRecordValuePath,
    oldValue: T | null,
    newValue: T | null,
    confirmMethod: 'Enter' | 'Tab' | null,
  ): DataRecordValueChanged<T> {
    return {
      _type: 'data.record.value.changed',
      timestamp: timestampEpochMillis(),

      record,
      path,
      oldValue,
      newValue,
      confirmMethod,
    }
  },
  hasManyItemAdded(
    record: DataRecord,
    parentPath: DataRecordPathParentElement[],
    nestedModel: NestedModel,
    newRecord: DataRecord,
  ): HasManyItemAdded {
    return {
      _type: 'data.record.has.many.item.added',
      timestamp: timestampEpochMillis(),
      record,
      parentPath,
      nestedModel,
      newRecord,
    }
  },
}
