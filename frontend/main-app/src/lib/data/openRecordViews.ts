import type { DataRecordId, ModelId } from '@cozemble/model-core'
import { writable } from 'svelte/store'
import { navbarState } from './navbarState'

export interface OpenRecordView {
  _type: 'open.record.view'
  modelId: ModelId
  recordId: DataRecordId
}

export const openRecordViewStore = writable([] as OpenRecordView[])

function openRecordView(modelId: ModelId, recordId: DataRecordId, openNow: boolean) {
  openRecordViewStore.update((views) => {
    if (views.some((v) => v.recordId.value === recordId.value)) {
      return views
    }
    return [...views, { _type: 'open.record.view', recordId, modelId }]
  })
  if (openNow) {
    navbarState.set(recordId.value)
  }
}

function closeRecordView(recordId: DataRecordId) {
  openRecordViewStore.update((views) => views.filter((v) => v.recordId.value !== recordId.value))
}

export const openRecordViews = {
  open: openRecordView,
  close: closeRecordView,
}
