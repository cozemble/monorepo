import type { DataRecord } from '@cozemble/model-core'
import { writable } from 'svelte/store'
import type {
  PaginatedEditorHost,
  RecordDeleteOutcome,
  RecordSaveOutcome,
} from '@cozemble/data-paginated-editor'
import type { EventSourcedDataRecord } from '@cozemble/data-editor-sdk'
import { recordSaveSucceeded } from '@cozemble/data-paginated-editor/src/lib'

export const records = writable([] as DataRecord[])
const storageKey = 'app.cozemble.com.data.editor.records'
let localStorageSubscribed = false

export function bootstrapRecords(localStorage: Storage) {
  const stored = localStorage.getItem(storageKey)
  if (stored) {
    records.set(JSON.parse(stored))
  }
  if (!localStorageSubscribed) {
    records.subscribe((rs) => localStorage.setItem(storageKey, JSON.stringify(rs)))
    localStorageSubscribed = true
  }
}

export const paginatedEditorHost: PaginatedEditorHost = {
  async recordEdited(editedRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    records.update((rs) => {
      return rs.map((r) => {
        if (r.id.value === editedRecord.record.id.value) {
          return editedRecord.record
        } else {
          return r
        }
      })
    })
    return recordSaveSucceeded(editedRecord.record)
  },

  async saveNewRecord(newRecord: EventSourcedDataRecord): Promise<RecordSaveOutcome> {
    records.update((rs) => [...rs, newRecord.record])
    return recordSaveSucceeded(newRecord.record)
  },

  async deleteRecord(record: DataRecord): Promise<RecordDeleteOutcome> {
    records.update((rs) => rs.filter((r) => r.id.value !== record.id.value))
    return recordSaveSucceeded(record)
  },
}
