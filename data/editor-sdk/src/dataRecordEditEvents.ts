import { getContext, setContext } from 'svelte'
import type {
  DataRecord,
  DataRecordPath,
  DataRecordPathElement,
  HasManyRelationship,
  ModelId,
} from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'

const dataRecordEditorClientContext = 'com.cozemble.data.record.editor.client.context'

export interface DataRecordCreatedEvent {
  _type: 'data.record.created'
  modelId: ModelId
  creatorId: string
}

function dataRecordCreatedEvent(modelId: ModelId, creatorId: string): DataRecordCreatedEvent {
  return {
    _type: 'data.record.created',
    modelId,
    creatorId,
  }
}

export interface DataRecordEditAborted {
  _type: 'data.record.edit.aborted'
  record: DataRecord
  path: DataRecordPath
}

export interface DataRecordValueChanged<T = any> {
  _type: 'data.record.value.changed'
  record: DataRecord
  path: DataRecordPath
  oldValue: T | null
  newValue: T | null
  confirmMethod: 'Enter' | 'Tab' | null
}

export interface HasManyItemAdded {
  _type: 'data.record.has.many.item.added'
  record: DataRecord
  parentPath: DataRecordPathElement[]
  relationship: HasManyRelationship
  newRecord: DataRecord
}

export type DataRecordEditEvent = DataRecordValueChanged | HasManyItemAdded | DataRecordCreatedEvent
export type DataRecordControlEvent = DataRecordEditAborted

export const dataRecordControlEvents = {
  editAborted(record: DataRecord, path: DataRecordPath): DataRecordEditAborted {
    return {
      _type: 'data.record.edit.aborted',
      record,
      path,
    }
  },
}
export const dataRecordEditEvents = {
  recordCreated: dataRecordCreatedEvent,
  valueChanged<T>(
    record: DataRecord,
    path: DataRecordPath,
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
    parentPath: DataRecordPathElement[],
    relationship: HasManyRelationship,
    newRecord: DataRecord,
  ): HasManyItemAdded {
    return {
      _type: 'data.record.has.many.item.added',
      record,
      parentPath,
      relationship,
      newRecord,
    }
  },
}

export interface DataRecordEditorClient {
  dispatchControlEvent(event: DataRecordControlEvent): void

  dispatchEditEvent(event: DataRecordEditEvent): void
}

export const dataRecordEditor = {
  getClient: (): DataRecordEditorClient => {
    return mandatory(
      getContext(dataRecordEditorClientContext),
      `No data record editor client found in context`,
    )
  },
}

export const dataRecordEditorHost = {
  setClient: (client: DataRecordEditorClient) => {
    return setContext(dataRecordEditorClientContext, client)
  },
}