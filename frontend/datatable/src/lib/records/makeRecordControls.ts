import type { EventSourcedDataRecordsStore } from './EventSourcedDataRecordsStore'
import type { RecordControls } from './RecordControls'
import type { Writable } from 'svelte/store'
import { saveExistingRecord, saveNewRecord } from '../appBackend'
import type { DataRecordId, Model, SystemConfiguration } from '@cozemble/model-core'
import { justErrorMessage, mandatory } from '@cozemble/lang-util'
import { modelFns } from '@cozemble/model-api'
import type { ErrorVisibilityByRecordId } from './helpers'
import type { RecordSaver } from '../backend/Backend'

export function makeRecordControls(
  systemConfigurationProvider: () => SystemConfiguration,
  recordSaver: RecordSaver,
  modelsProvider: () => Model[],
  errorVisibilityByRecordId: Writable<ErrorVisibilityByRecordId>,
  records: EventSourcedDataRecordsStore,
  lastSavedByRecordId: Writable<Map<string, number>>,
  newUnsavedRecords = [] as DataRecordId[],
): RecordControls {
  return {
    addNewRecord(): DataRecordId {
      const newRecordId = records.addNewRecord()
      newUnsavedRecords.push(newRecordId)
      return newRecordId
    },
    async saveRecord(recordId: DataRecordId) {
      const record = mandatory(
        records.get().find((r) => r.record.id.value === recordId.value),
        `Record with id ${recordId.value} not found`,
      )
      const errors = modelFns.validate(
        systemConfigurationProvider(),
        modelsProvider(),
        record.record,
      )
      errorVisibilityByRecordId.update((recordErrorsById) => {
        recordErrorsById.set(record.record.id.value, errors.size > 0)
        return recordErrorsById
      })
      if (errors.size > 0) {
        return justErrorMessage(`${errors.size} error(s) when saving record`)
      }
      const indexOfNewUnsavedRecords = newUnsavedRecords.findIndex(
        (id) => id.value === recordId.value,
      )
      if (indexOfNewUnsavedRecords >= 0) {
        await recordSaver.saveNewRecord(record)
        // remove recordId from newUnsavedRecords
        newUnsavedRecords.splice(indexOfNewUnsavedRecords, 1)
      } else {
        await recordSaver.saveExistingRecord(record)
      }
      lastSavedByRecordId.update((lastSavedByRecordId) => {
        lastSavedByRecordId.set(record.record.id.value, Date.now())
        return lastSavedByRecordId
      })
      return null
    },
  }
}
