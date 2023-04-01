import type {
  DataRecord,
  DataRecordId,
  DataRecordValuePath,
  DataRecordPathParentElement,
  ModelId,
} from '@cozemble/model-core'
import { NestedModel } from '@cozemble/model-core'

export interface DataRecordCreatedEvent {
  _type: 'data.record.created'
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
    modelId,
    recordId,
    creatorId,
  }
}

export interface DataRecordDeletedEvent {
  _type: 'data.record.deleted'
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

export interface DataRecordValueChanged<T = any> {
  _type: 'data.record.value.changed'
  record: DataRecord
  path: DataRecordValuePath
  oldValue: T | null
  newValue: T | null
  confirmMethod: 'Enter' | 'Tab' | null
}

export interface HasManyItemAdded {
  _type: 'data.record.has.many.item.added'
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

export type DataRecordControlEvent = DataRecordEditAborted

export const dataRecordControlEvents = {
  editAborted(record: DataRecord, path: DataRecordValuePath): DataRecordEditAborted {
    return {
      _type: 'data.record.edit.aborted',
      record,
      path,
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
      record,
      parentPath,
      nestedModel,
      newRecord,
    }
  },
}
