import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { Model } from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { mandatory } from '@cozemble/lang-util'
import type { Readable } from 'svelte/store'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import type { DataRecord, DataRecordId } from '@cozemble/model-core/dist/esm'
import type { DataTableFocus, DataTableFocusControls2 } from '../focus/DataTableFocus'
import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'

const eventSourceModelContextKey = 'model.records.context.eventSourcedModel'
const modelContextKey = 'model.records.context.model'
const eventSourcedRecordsContextKey = 'model.records.context.eventSourcedRecords'
const recordsContextKey = 'model.records.context.records'
const focusContextKey = 'model.records.context.focus'
const focusControlsContextKey = 'model.records.context.focusControls'
const dirtyRecordsContextKey = 'model.records.context.dirtyRecords'

export const modelRecordsContextFns = {
  setEventSourcedModel: (model: Readable<EventSourcedModel>) => {
    setContext(eventSourceModelContextKey, model)
  },
  setModel: (model: Readable<Model>) => {
    setContext(modelContextKey, model)
  },
  setEventSourcedRecords: (records: Readable<EventSourcedDataRecord[]>) => {
    setContext(eventSourcedRecordsContextKey, records)
  },
  setRecords: (records: Readable<DataRecord[]>) => {
    setContext(recordsContextKey, records)
  },
  setFocus: (focus: Readable<DataTableFocus>) => {
    setContext(focusContextKey, focus)
  },
  setFocusControls: (focusControls: DataTableFocusControls2) => {
    setContext(focusControlsContextKey, focusControls)
  },
  setDirtyRecords: (dirtyRecords: Readable<DataRecordId[]>) => {
    setContext(dirtyRecordsContextKey, dirtyRecords)
  },
  getEventSourcedModel: (): Readable<EventSourcedModel> => {
    return mandatory(
      getContext(eventSourceModelContextKey),
      `No event sourced model found in context`,
    )
  },
  getModel: (): Readable<Model> => {
    return mandatory(getContext(modelContextKey), `No model found in context`)
  },
  getEventSourcedRecords: (): EventSourcedDataRecordsStore => {
    return mandatory(
      getContext(eventSourcedRecordsContextKey),
      `No records event sourced records found in context`,
    )
  },
  getRecords: (): Readable<DataRecord[]> => {
    return mandatory(getContext(recordsContextKey), `No records found in context`)
  },
  getFocus: (): Readable<DataTableFocus> => {
    return mandatory(getContext(focusContextKey), `No focus found in context`)
  },
  getFocusControls: (): DataTableFocusControls2 => {
    return mandatory(getContext(focusControlsContextKey), `No focus controls found in context`)
  },
  getDirtyRecords: (): Readable<DataRecordId[]> => {
    return mandatory(getContext(dirtyRecordsContextKey), `No dirty records store found in context`)
  },
}
