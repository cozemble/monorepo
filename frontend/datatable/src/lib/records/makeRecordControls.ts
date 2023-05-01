import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'
import type { RecordControls } from './RecordControls'
import type { Writable } from 'svelte/store'
import { saveExistingRecord } from '../appBackend'
import type { DataRecordId } from '@cozemble/model-core'
import { mandatory } from '@cozemble/lang-util'

export function makeRecordControls(
  records: EventSourcedDataRecordsStore,
  lastSavedByRecordId: Writable<Map<string, number>>,
): RecordControls {
  return {
    async saveRecord(recordId: DataRecordId) {
      const record = mandatory(
        records.get().find((r) => r.record.id.value === recordId.value),
        `Record with id ${recordId.value} not found`,
      )
      await saveExistingRecord(record)
      lastSavedByRecordId.update((lastSavedByRecordId) => {
        lastSavedByRecordId.set(record.record.id.value, Date.now())
        return lastSavedByRecordId
      })
    },
  }
}
