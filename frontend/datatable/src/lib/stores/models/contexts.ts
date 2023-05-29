// * Refactored from lib/records/modelRecordsContextFns.ts

import type { Readable, Writable } from 'svelte/store'

import type { EventSourcedModel } from '@cozemble/model-event-sourced'
import type { DataRecord, DataRecordId, Model, NestedModelId } from '@cozemble/model-core'
import type { EventSourcedRecordGraph } from '@cozemble/model-event-sourced'

import type { DataTableFocus, DataTableFocusControls2 } from '$lib/focus/DataTableFocus'
import type { RecordControls } from '$lib/records/RecordControls'
import type { ModelControls } from '$lib/records/ModelControls'
import type { ErrorVisibilityByRecordId } from '$lib/records/helpers'
import type { GettableWritable } from '$lib/editors/GettableWritable'
import type { FilterParams } from '$lib/backend/Backend'

import { getContext, setContext } from 'svelte'
import { mandatory } from '@cozemble/lang-util'

//

/** Create a context with a given name and type */
function createContext<TContext>(name: string) {
  const key = `model.records.context.${name}`

  return {
    key,
    set: (model: TContext) => setContext(key, model),
    get: (): TContext => mandatory(getContext(key), `No ${name} found in context`),
  }
}

//

export const eventSourcedModel = createContext<Readable<EventSourcedModel>>('eventSourcedModel')
export const model = createContext<Readable<Model>>('model')

export const eventSourcedRecords = createContext<EventSourcedRecordGraph>('eventSourcedRecords')
export const records = createContext<Readable<DataRecord[]>>('records')

export const focus = createContext<Readable<DataTableFocus>>('focus')
export const focusControls = createContext<DataTableFocusControls2>('focusControls')

export const dirtyRecords = createContext<Readable<DataRecordId[]>>('dirtyRecords')
export const recordControls = createContext<RecordControls>('recordControls')
export const modelControls = createContext<ModelControls>('modelControls')

export const errorVisibilityByRecordId = createContext<GettableWritable<ErrorVisibilityByRecordId>>(
  'errorVisibilityByRecordId',
)
export const filterParams = createContext<Writable<FilterParams>>('filterParams')
export const nestedModelBeingEdited =
  createContext<Writable<NestedModelId | null>>('nestedModelBeingEdited')
export const permitRecordAdditions = createContext<Writable<boolean>>('permitRecordAdditions')

export const getAll = () => ({
  eventSourcedModel: eventSourcedModel.get(),
  model: model.get(),
  eventSourcedRecords: eventSourcedRecords.get(),
  records: records.get(),
  focus: focus.get(),
  focusControls: focusControls.get(),
  dirtyRecords: dirtyRecords.get(),
  recordControls: recordControls.get(),
  modelControls: modelControls.get(),
  errorVisibilityByRecordId: errorVisibilityByRecordId.get(),
  filterParams: filterParams.get(),
  nestedModelBeingEdited: nestedModelBeingEdited.get(),
  permitRecordAdditions: permitRecordAdditions.get(),
})
