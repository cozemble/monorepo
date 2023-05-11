import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, DataRecordId, Model, NestedModelId } from '@cozemble/model-core'
import { getContext, setContext } from 'svelte'
import { mandatory } from '@cozemble/lang-util'
import type { Readable, Writable } from 'svelte/store'
import type { DataTableFocus, DataTableFocusControls2 } from '../focus/DataTableFocus'
import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'
import type { RecordControls } from './RecordControls'
import type { ModelControls } from './ModelControls'
import type { ErrorVisibilityByRecordId } from './helpers'
import type { GettableWritable } from '../editors/GettableWritable'
import type { FilterParams } from '../backend/Backend'
import { get } from 'svelte/store'

const eventSourceModelContextKey = 'model.records.context.eventSourcedModel'
const modelContextKey = 'model.records.context.model'
const eventSourcedRecordsContextKey = 'model.records.context.eventSourcedRecords'
const recordsContextKey = 'model.records.context.records'
const focusContextKey = 'model.records.context.focus'
const focusControlsContextKey = 'model.records.context.focusControls'
const dirtyRecordsContextKey = 'model.records.context.dirtyRecords'
const recordControlsContextKey = 'model.records.context.recordControls'
const modelControlsContextKey = 'model.records.context.modelControls'
const errorVisibilityByRecordIdContextKey = 'model.records.context.errorVisibilityByRecordId'
const filterParamsContextKey = 'model.records.context.filterParams'
const nestedModelBeingEditedContextKey = 'model.records.context.nestedModelBeingEdited'
const permitRecordAdditionsContextKey = 'model.records.context.permitRecordAdditions'

export const modelRecordsContextFns = {
  setEventSourcedModel: (model: Readable<EventSourcedModel>) => {
    setContext(eventSourceModelContextKey, model)
  },
  setModel: (model: Readable<Model>) => {
    setContext(modelContextKey, model)
  },
  setEventSourcedRecords: (records: EventSourcedDataRecordsStore) => {
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
  setRecordControls: (recordControls: RecordControls) => {
    setContext(recordControlsContextKey, recordControls)
  },
  setModelControls: (modelControls: ModelControls) => {
    setContext(modelControlsContextKey, modelControls)
  },
  setErrorVisibilityByRecordId: (visibility: GettableWritable<ErrorVisibilityByRecordId>) => {
    setContext(errorVisibilityByRecordIdContextKey, visibility)
  },
  setFilterParams: (filterParams: Writable<FilterParams>) => {
    setContext(filterParamsContextKey, filterParams)
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
  getRecordControls: (): RecordControls => {
    return mandatory(getContext(recordControlsContextKey), `No record controls found in context`)
  },
  getModelControls: (): ModelControls => {
    return mandatory(getContext(modelControlsContextKey), `No model controls found in context`)
  },
  getErrorVisibilityByRecordId: (): GettableWritable<ErrorVisibilityByRecordId> => {
    return mandatory(
      getContext(errorVisibilityByRecordIdContextKey),
      `No error visibility by record id found in context`,
    )
  },
  getFilterParams: (): Writable<FilterParams> => {
    return mandatory(getContext(filterParamsContextKey), `No filter params found in context`)
  },
  setNestedModelBeingEdited(writable: Writable<NestedModelId | null>) {
    setContext(nestedModelBeingEditedContextKey, writable)
  },
  getNestedModelBeingEdited(): Writable<NestedModelId | null> {
    return mandatory(
      getContext(nestedModelBeingEditedContextKey),
      `No nested model being edited found in context`,
    )
  },
  setPermitRecordAdditions(writable: Writable<boolean>) {
    if (getContext(permitRecordAdditionsContextKey) === undefined) {
      setContext(permitRecordAdditionsContextKey, writable)
    }
  },
  getPermitRecordAdditions(): Writable<boolean> {
    return mandatory(
      getContext(permitRecordAdditionsContextKey),
      `No permit record additions found in context`,
    )
  },
}
