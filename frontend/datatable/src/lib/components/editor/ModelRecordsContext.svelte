<script lang="ts">
import { onDestroy } from 'svelte'
import { derived, writable } from 'svelte/store'

// Cozemble
import { eventSourcedDataRecordFns } from '@cozemble/data-editor-sdk'
import { eventSourcedModelFns } from '@cozemble/model-event-sourced'
import type { DataRecord, Model, ModelId } from '@cozemble/model-core'
import { dataRecordFns } from '@cozemble/model-api'
import type { NestedModelId } from '@cozemble/model-core'

// stores
import { allEventSourcedModels, allModels } from '$lib/stores/allModels'
import { systemConfiguration } from '$lib/stores/systemConfiguration'
import { currentUserId } from '$lib/stores/currentUserId'
// records <!-- TODO simplify -->
import { modelRecordsContextFns } from '$lib/records/modelRecordsContextFns'
import { makeFocusControls } from '$lib/records/makeFocusControls'
import type { LoadingState } from '$lib/records/RecordsContext'
import { makeRecordControls } from '$lib/records/makeRecordControls'
import { eventSourcedDataRecordsStore } from '$lib/records/EventSourcedDataRecordsStore'
import { makeModelControls } from '$lib/records/makeModelControls'
import type { ErrorVisibilityByRecordId } from '$lib/records/helpers'
// misc
import { emptyDataTableFocus } from '$lib/focus/DataTableFocus'
import { backend, getRecordsForModel } from '$lib/appBackend'
import {
  emptyFilterParams,
  type FilterParams,
  type RecordSaver,
} from '$lib/backend/Backend'
import { gettableWritable } from '$lib/editors/GettableWritable'

//

export let modelId: ModelId

export const recordLoader: (
  modelId: ModelId,
  filterParams: FilterParams,
) => Promise<DataRecord[]> = getRecordsForModel

const systemConfigurationProvider = () => $systemConfiguration
const modelsProvider = () => $allModels
export const eventSourcedRecords = eventSourcedDataRecordsStore(
  systemConfigurationProvider,
  modelsProvider,
  () => $model,
  $currentUserId,
)
export const recordSaver: RecordSaver = backend
export const oneOnly = false
export const permitRecordAdditions = true

// model
const eventSourcedModel = derived(allEventSourcedModels, (models) =>
  eventSourcedModelFns.findById(models, modelId),
)
const model = derived(eventSourcedModel, (model) => model.model)

// records
const records = derived(eventSourcedRecords, (records) =>
  records.map((record) => record.record),
)
const errorVisibilityByRecordId = gettableWritable(
  new Map() as ErrorVisibilityByRecordId,
)
const lastSavedByRecordId = writable(new Map<string, number>())
const dirtyRecords = derived(
  [eventSourcedRecords, lastSavedByRecordId],
  ([records, lastSavedByRecordId]) => {
    return records
      .filter((r) => {
        const lastSaved = lastSavedByRecordId.get(r.record.id.value) ?? 0
        return r.events.some((e) => e.timestamp.value > lastSaved)
      })
      .map((r) => r.record.id)
  },
)

// focus
const focus = gettableWritable(
  emptyDataTableFocus(() => eventSourcedRecords.get().map((r) => r.record)),
)
const focusControls = makeFocusControls(
  modelsProvider,
  () => $records,
  systemConfigurationProvider,
  focus,
)

// misc
const loadingState = writable('loading' as LoadingState)
const filterParams = writable(emptyFilterParams())
let debounceTimeout: any

// context <!-- TODO simplify -->
modelRecordsContextFns.setEventSourcedModel(eventSourcedModel)
modelRecordsContextFns.setModel(model)
modelRecordsContextFns.setEventSourcedRecords(eventSourcedRecords)
modelRecordsContextFns.setRecords(records)
modelRecordsContextFns.setFocus(focus)
modelRecordsContextFns.setFocusControls(focusControls)
modelRecordsContextFns.setDirtyRecords(dirtyRecords)
modelRecordsContextFns.setRecordControls(
  makeRecordControls(
    systemConfigurationProvider,
    recordSaver,
    modelsProvider,
    errorVisibilityByRecordId,
    eventSourcedRecords,
    lastSavedByRecordId,
  ),
)
modelRecordsContextFns.setModelControls(
  makeModelControls(allEventSourcedModels),
)
modelRecordsContextFns.setErrorVisibilityByRecordId(errorVisibilityByRecordId)
modelRecordsContextFns.setFilterParams(filterParams)
modelRecordsContextFns.setNestedModelBeingEdited(
  writable(null as NestedModelId | null),
)
modelRecordsContextFns.setPermitRecordAdditions(writable(permitRecordAdditions))

let someRecordsLoaded = false

//

const unsubAllEventSourcedModels = allModels.subscribe((models) => {
  eventSourcedRecords.update((records) =>
    records.map((r) => ({ ...r, models })),
  )
})

function newEmptyRecord(model: Model) {
  return eventSourcedDataRecordFns.fromRecord(
    $allModels,
    dataRecordFns.newInstance($model, $currentUserId),
  )
}

async function loadRecords(filterParams: FilterParams) {
  loadingState.set('loading')

  const loaded = await recordLoader(modelId, filterParams)

  eventSourcedRecords.set([
    ...loaded.map((r) => eventSourcedDataRecordFns.fromRecord($allModels, r)),
    !oneOnly && newEmptyRecord($model),
  ])

  someRecordsLoaded = true
  loadingState.set('loaded')
}

/** unsubscribe from filterParams when they change, and load records */
const unsubFilterParams = filterParams.subscribe((filterParams) => {
  debounceTimeout = setTimeout(
    () => {
      loadRecords(filterParams)
    },
    someRecordsLoaded ? 500 : 0,
  )
})

// on destroy, clean up
onDestroy(() => {
  if (debounceTimeout) {
    clearTimeout(debounceTimeout)
  }
  unsubFilterParams()
  unsubAllEventSourcedModels()
})
</script>

<slot {focusControls} />
