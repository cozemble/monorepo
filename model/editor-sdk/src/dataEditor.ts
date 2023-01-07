import { getContext, setContext } from 'svelte'
import type { DataRecord, DataRecordPath } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'

const dataRecordEditorClientContext = 'com.cozemble.data.record.editor.client.context'

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

export type DataRecordEditEvent = DataRecordEditAborted | DataRecordValueChanged

export const dataRecordEditEvents = {
  editAborted(record: DataRecord, path: DataRecordPath): DataRecordEditAborted {
    return {
      _type: 'data.record.edit.aborted',
      record,
      path,
    }
  },
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
}

export interface DataRecordEditorClient {
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
